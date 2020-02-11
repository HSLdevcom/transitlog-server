import {
  JoreDeparture,
  JoreDepartureWithOrigin,
  JoreEquipment,
  JoreExceptionDay,
  JoreRoute,
  JoreRouteData,
  JoreRouteDepartureData,
  JoreStop,
  JoreStopSegment,
  JoreTerminal,
} from '../types/Jore'
import { ExceptionDay, Scalars } from '../types/generated/schema-types'
import { dayTypes, getDayTypeFromDate } from '../utils/dayTypes'
import { compact, flatten, orderBy, uniq } from 'lodash'
import SQLDataSource from '../utils/SQLDataSource'
import { PlannedJourneyData } from '../creators/createJourneyResponse'
import { endOfYear, format, getYear, isEqual, isSameYear, startOfYear } from 'date-fns'
import { cacheFetch } from '../cache'
import { CachedFetcher } from '../types/CachedFetcher'
import { createExceptionDayObject } from '../objects/createExceptionDayObject'
import { getKnex } from '../knex'

const knex = getKnex()
const ONE_DAY = 24 * 60 * 60

type ExceptionDaysScoped = {
  normal: string[]
  [scope: string]: string[]
}

// install postgis functions in knex.postgis;
const st = require('knex-postgis')(knex)

export class JoreDataSource extends SQLDataSource {
  constructor() {
    super({ log: false, name: 'jore' })
    // Add your instance of Knex to the DataSource
    this.knex = knex
  }

  async getRoutes(): Promise<JoreRoute[]> {
    const query = this.db.raw(
      `
                SELECT route.route_id,
                       route.direction,
                       route.destination_fi,
                       route.destinationstop_id,
                       route.origin_fi,
                       route.originstop_id,
                       route.name_fi,
                       route.name_fi          as route_name,
                       route.date_begin,
                       route.date_end,
                       route.date_modified,
                       route.route_length,
                       jore.route_mode(route) as mode
                FROM jore.route route;
      `
    )

    return this.getBatched(query)
  }

  async getRoute(routeId, direction): Promise<JoreRoute[]> {
    const query = this.db.raw(
      `
                SELECT route.route_id,
                       route.direction,
                       route.destination_fi,
                       route.destinationstop_id,
                       route.origin_fi,
                       route.originstop_id,
                       route.name_fi,
                       route.name_fi          as route_name,
                       route.date_begin,
                       route.date_end,
                       route.date_modified,
                       route.route_length,
                       jore.route_mode(route) as mode
                FROM jore.route route
                WHERE route.route_id = :routeId
                  AND route.direction = :direction;
      `,
      { routeId, direction: direction + '' }
    )

    return this.getBatched(query)
  }

  async getRouteGeometry(
    routeId: string,
    direction: Scalars['Direction'],
    date: string
  ): Promise<JoreRoute[]> {
    const query = this.db.raw(
      `SELECT route.route_id,
                route.direction,
                route.route_length,
                jore.route_mode(route) as          mode,
                ST_AsGeoJSON(geometry.geom)::JSONB geometry,
                geometry.date_begin,
                geometry.date_end,
                geometry.date_imported
         from jore.route route,
              jore.geometry geometry
         WHERE route.route_id = :routeId
           AND route.direction = :direction
           AND geometry.route_id = route.route_id
           AND geometry.direction = route.direction
           AND :date >= geometry.date_begin
           AND :date <= geometry.date_end
           AND :date >= route.date_begin
           AND :date <= route.date_end
           AND route.date_begin <= geometry.date_end
           AND route.date_end >= geometry.date_begin;`,
      { routeId, direction: direction + '', date }
    )

    return this.getBatched(query)
  }

  async getStopSegments(stopId: string, date: string): Promise<JoreRouteData[]> {
    const query = this.db.raw(
      `SELECT route_segment.route_id,
              route_segment.direction,
              route.originstop_id,
              route.route_length,
              route.name_fi as route_name,
              route.origin_fi,
              route.destination_fi,
              route_segment.date_begin,
              route_segment.date_end,
              route_segment.timing_stop_type,
              route_segment.stop_index,
              route_segment.date_modified,
              jore.route_mode(route) as mode,
              stop.lat,
              stop.lon,
              stop.stop_id,
              stop.short_id,
              stop.name_fi,
              stop.stop_radius
         FROM jore.stop stop
            LEFT JOIN jore.route_segment route_segment USING (stop_id)
            LEFT JOIN jore.route route USING (route_id, direction, date_begin, date_end, date_modified)
         WHERE stop.stop_id = :stopId
           AND route.route_id IS NOT NULL;`,
      { stopId, date }
    )

    return this.getBatched(query)
  }

  async getSimpleStop(stopId: string): Promise<JoreStop | null> {
    const query = this.db.raw(
      `
                SELECT stop.stop_id,
                       stop.short_id,
                       stop.lat,
                       stop.lon,
                       stop.name_fi,
                       stop.stop_radius,
                       jore.stop_modes(stop, null) as modes
                FROM jore.stop stop
                WHERE stop.stop_id = :stopId;
      `,
      { stopId: (stopId || '') + '' }
    )

    const result = await this.getBatched(query)
    return result[0] || null
  }

  async getStops(date?: string, terminalId?: string): Promise<JoreStop[]> {
    const query = date
      ? this.db.raw(
          `
          SELECT stop.stop_id,
                 stop.short_id,
                 stop.lat,
                 stop.lon,
                 stop.name_fi,
                 stop.stop_radius,
                 route_segment.date_modified,
                 route_segment.route_id,
                 route_segment.direction,
                 route_segment.timing_stop_type,
                 (select distinct jore.route_mode(route)) as modes
          FROM jore.stop stop
          LEFT OUTER JOIN (
              select distinct on (inner_route_segment.route_id, inner_route_segment.stop_id) *
              from jore.route_segment inner_route_segment
              where :date between inner_route_segment.date_begin and inner_route_segment.date_end
              order by inner_route_segment.route_id, inner_route_segment.stop_id,
                       inner_route_segment.timing_stop_type DESC, inner_route_segment.date_modified DESC
          ) route_segment USING (stop_id)
          LEFT JOIN jore.route route USING (route_id, direction, date_begin, date_end)
          WHERE :terminalId IS NULL OR stop.terminal_id = :terminalId;`,
          { date, terminalId: terminalId || knex.raw('NULL') }
        )
      : this.db.raw(
          `
          SELECT stop.stop_id,
                 stop.short_id,
                 stop.lat,
                 stop.lon,
                 stop.name_fi,
                 stop.stop_radius,
                 jore.stop_modes(stop, null) as modes
          FROM jore.stop stop
          WHERE :terminalId IS NULL OR stop.terminal_id = :terminalId;
        `,
          { terminalId: terminalId || knex.raw('NULL') }
        )

    return this.getBatched(query)
  }

  async getTerminal(terminalId): Promise<JoreTerminal | null> {
    const query = this.db.raw(
      `SELECT terminal.terminal_id,
             terminal.lat,
             terminal.lon,
             terminal.name_fi,
             terminal.name_se,
             terminal.date_imported,
             stop.stop_id,
             stop.terminal_id as stop_terminal_id,
             jore.stop_modes(stop, null) as modes
      FROM jore.terminal terminal
        LEFT JOIN jore.stop stop USING (terminal_id)
      WHERE terminal.terminal_id = :terminalId;`,
      { terminalId }
    )

    return this.getBatched(query)
  }

  async getTerminals(): Promise<JoreTerminal[]> {
    const query = this.db.raw(
      `SELECT terminal.terminal_id,
             terminal.lat,
             terminal.lon,
             terminal.name_fi,
             terminal.name_se,
             terminal.date_imported,
             stop.stop_id,
             stop.terminal_id as stop_terminal_id,
             jore.stop_modes(stop, null) as modes
      FROM jore.terminal terminal
        LEFT JOIN jore.stop stop USING (terminal_id);`
    )

    return this.getBatched(query)
  }

  async getEquipment(): Promise<JoreEquipment[]> {
    const query = this.db
      .withSchema('jore')
      .select()
      .from('equipment')

    return this.getBatched(query)
  }

  async getEquipmentById(
    vehicleId: string | number,
    operatorId: string
  ): Promise<JoreEquipment[]> {
    const joreVehicleId = vehicleId + ''
    const joreOperatorId = (operatorId + '').padStart(4, '0')

    const query = this.db
      .withSchema('jore')
      .select()
      .from('equipment')
      .where({ vehicle_id: joreVehicleId, operator_id: joreOperatorId })

    return this.getBatched(query)
  }

  async getRouteSegments(
    routeId: string,
    direction: Scalars['Direction'],
    dateBegin?: string,
    dateEnd?: string
  ): Promise<JoreRouteData[]> {
    const query = this.db.raw(
      `select route.route_id,
       route.direction,
       route.name_fi,
       route.name_fi as route_name,
       route.route_length,
       route.destination_fi,
       route.origin_fi,
       route.destinationstop_id,
       route.originstop_id,
       jore.route_mode(route) as mode,
       route_segment.next_stop_id,
       route_segment.date_begin,
       route_segment.date_end,
       route_segment.date_modified,
       route_segment.duration,
       route_segment.stop_index,
       route_segment.distance_from_previous,
       route_segment.distance_from_start,
       route_segment.destination_fi,
       route_segment.timing_stop_type,
       stop.stop_id,
       stop.lat,
       stop.lon,
       stop.short_id,
       stop.name_fi,
       stop.stop_radius
FROM jore.route route,
     jore.route_route_segments(route) route_segment
LEFT OUTER JOIN jore.stop stop ON stop.stop_id = route_segment.stop_id
WHERE route.route_id = :routeId AND route.direction = :direction ${
        dateBegin && dateEnd
          ? this.db.raw(
              `AND route.date_begin = :dateBegin AND route.date_end = :dateEnd LIMIT 1`,
              {
                dateBegin,
                dateEnd,
              }
            )
          : ''
      };`,
      { routeId, direction: direction + '' }
    )

    return this.getBatched(query)
  }

  async getJourneyDepartures(
    routeId: string,
    direction: Scalars['Direction'],
    date: string
  ): Promise<JoreRouteDepartureData[]> {
    const dayTypes = await this.getDayTypesForDateAndRoute(date, routeId)

    const query = this.db.raw(
      `
    SELECT departure.stop_id,
       departure.route_id,
       departure.direction,
       departure.hours,
       departure.minutes,
       departure.day_type,
       departure.extra_departure,
       departure.is_next_day,
       departure.arrival_is_next_day,
       departure.arrival_hours,
       departure.arrival_minutes,
       departure.terminal_time,
       departure.recovery_time,
       departure.equipment_type,
       departure.equipment_required,
       departure.operator_id,
       departure.trunk_color_required,
       departure.date_begin,
       departure.date_end,
       departure.departure_id,
       departure.bid_target_id,
       departure.date_imported
FROM jore.departure departure
    WHERE day_type IN (${dayTypes.map((dayType) => `'${dayType}'`).join(',')})
      AND departure.route_id = :routeId
      AND departure.direction = :direction
      AND departure.date_begin <= :date
ORDER BY departure.departure_id ASC,
         departure.hours ASC,
         departure.minutes ASC;`,
      { routeId, direction: direction + '', date }
    )

    return this.getBatched(query)
  }

  async getJourneyStops(routeId, direction, date): Promise<JoreStopSegment[]> {
    if (!routeId || !direction || !date) {
      return []
    }

    const query = this.db.raw(
      `
                SELECT stop.stop_id,
                       stop.lat,
                       stop.lon,
                       stop.short_id,
                       stop.name_fi,
                       stop.stop_radius,
                       stop.stop_type,
                       route_segment.date_begin,
                       route_segment.date_end,
                       route_segment.date_modified,
                       route_segment.destination_fi,
                       route_segment.distance_from_previous,
                       route_segment.distance_from_start,
                       route_segment.duration,
                       route_segment.route_id,
                       route_segment.direction,
                       route_segment.stop_index,
                       route_segment.next_stop_id,
                       route_segment.timing_stop_type,
                       route.originstop_id,
                       route.destination_fi,
                       route.origin_fi,
                       route.route_length,
                       route.name_fi as route_name,
                       jore.route_mode(route) as mode
                FROM jore.route_segment route_segment
                     LEFT JOIN jore.stop stop USING (stop_id)
                     LEFT JOIN jore.route route USING (route_id, direction, date_begin, date_end)
                WHERE route_segment.route_id = :routeId
                  AND route_segment.direction = :direction;`,
      { routeId, direction: direction + '', date }
    )

    return this.getBatched(query)
  }

  async getDepartureData(routeId, direction, date): Promise<PlannedJourneyData> {
    const stopsPromise = this.getJourneyStops(routeId, direction, date)
    const departuresPromise = this.getJourneyDepartures(routeId, direction, date)

    const [stops = [], departures = []] = await Promise.all([stopsPromise, departuresPromise])
    return { stops, departures } as PlannedJourneyData
  }

  departureStopFields = `
stop.stop_id,
stop.lat,
stop.lon,
stop.short_id,
stop.name_fi,
stop.stop_radius,
stop.stop_type,
stop.terminal_id,
route_segment.date_begin,
route_segment.date_end,
route_segment.date_modified,
route_segment.destination_fi,
route_segment.distance_from_previous,
route_segment.distance_from_start,
route_segment.duration,
route_segment.route_id,
route_segment.direction,
route_segment.stop_index,
route_segment.next_stop_id,
route_segment.timing_stop_type,
route.destination_fi,
route.origin_fi,
route.route_length,
route.name_fi          as route_name,
jore.route_mode(route) as mode
  `

  async getDeparturesStops(stopId, date): Promise<JoreStopSegment[]> {
    if (!stopId) {
      return []
    }

    const query = this.db.raw(
      `
      SELECT ${this.departureStopFields}
      FROM jore.route_segment route_segment
      LEFT JOIN jore.stop stop USING (stop_id)
      LEFT JOIN jore.route route USING (route_id, direction, date_begin, date_end, date_modified)
      WHERE route_segment.stop_id = :stopId;`,
      { stopId, date }
    )

    return this.getBatched(query)
  }

  async getTerminalDeparturesStops(terminalId, date): Promise<JoreStopSegment[]> {
    if (!terminalId) {
      return []
    }

    const query = this.db.raw(
      `
      SELECT ${this.departureStopFields}
      FROM jore.stop stop
      LEFT JOIN jore.route_segment route_segment USING (stop_id)
      LEFT JOIN jore.route route USING (route_id, direction, date_begin, date_end, date_modified)
      WHERE stop.terminal_id = :terminalId;`,
      { terminalId, date }
    )

    return this.getBatched(query)
  }

  async getDepartureOperators(date): Promise<string> {
    const exceptionDayTypes = await this.getDayTypesForDate(date)
    // TODO: Ensure that the same operator drives both normal and exception days, always.
    // If not, we may need to be more precise with the day types.
    const dayTypes = uniq(flatten(Object.values(exceptionDayTypes)))

    const query = this.db.raw(
      `
SELECT DISTINCT ON (operator_id, route_id, direction, hours, minutes) operator_id, route_id, direction, hours, minutes
FROM jore.departure
    WHERE day_type IN (${dayTypes.map((dayType) => `'${dayType}'`).join(',')})
      AND date_begin <= :date
ORDER BY operator_id, route_id, direction, hours, minutes, date_imported DESC;`,
      { date }
    )

    return this.getCachedAndBatched(query, 24 * 60 * 60)
  }

  departureFields = `
    departure.route_id,
    departure.direction,
    departure.stop_id,
    departure.hours,
    departure.minutes,
    departure.day_type,
    departure.extra_departure,
    departure.is_next_day,
    departure.arrival_is_next_day,
    departure.arrival_hours,
    departure.arrival_minutes,
    departure.terminal_time,
    departure.recovery_time,
    departure.equipment_type,
    departure.equipment_required,
    departure.operator_id,
    departure.trunk_color_required,
    departure.date_begin,
    departure.date_end,
    departure.departure_id,
    departure.bid_target_id,
    departure.date_imported
  `

  originDepartureQueryFragment = `
  LEFT JOIN LATERAL (
    select *
    from jore.departure inner_departure
    where inner_departure.route_id = departure.route_id
      and inner_departure.direction = departure.direction
      and inner_departure.date_begin = departure.date_begin
      and inner_departure.date_end = departure.date_end
      and inner_departure.departure_id = departure.departure_id
      and inner_departure.day_type = departure.day_type
      and inner_departure.stop_id = (
        select originstop_id
        from jore.route route
        where route.route_id = departure.route_id
          and route.direction = departure.direction
          and route.date_begin <= departure.date_end
          and route.date_end >= departure.date_begin
        order by route.date_modified desc, route.date_begin desc 
        limit 1
      )
    order by inner_departure.hours ASC, inner_departure.minutes ASC
  ) origin_departure ON true
  `

  filterDeparturesByDayTypes(departures, dayTypes): JoreDeparture[] {
    return departures.filter((departure) => {
      const departureMode = departure.type

      const exceptionDaysForAll = dayTypes.all || []
      const exceptionDaysForMode = (departureMode ? dayTypes[departureMode] : []) || []

      const filterByDayTypes =
        exceptionDaysForMode.length !== 0 ? exceptionDaysForMode : dayTypes.normal || []

      const matchDayTypes = [...exceptionDaysForAll, ...filterByDayTypes]
      return matchDayTypes.includes(departure.day_type)
    })
  }

  async getDeparturesForStop(stopId, date): Promise<JoreDepartureWithOrigin[]> {
    const exceptionDayTypes = await this.getDayTypesForDate(date)
    const dayTypes = uniq(flatten(Object.values(exceptionDayTypes)))

    const query = this.db.raw(
      `
      SELECT ${this.departureFields},
            origin_departure.stop_id as origin_stop_id,
            origin_departure.hours as origin_hours,
            origin_departure.minutes as origin_minutes,
            origin_departure.is_next_day as origin_is_next_day,
            origin_departure.is_next_day as origin_is_next_day,
            origin_departure.extra_departure as origin_extra_departure,
            origin_departure.departure_id as origin_departure_id,
            origin_departure.date_begin as origin_date_begin,
            origin_departure.date_end as origin_date_end
      FROM jore.departure departure
        ${this.originDepartureQueryFragment}
      WHERE departure.stop_id = :stopId
        AND departure.day_type IN (${dayTypes.map((dayType) => `'${dayType}'`).join(',')})
      ORDER BY departure.hours ASC,
               departure.minutes ASC,
               departure.route_id ASC,
               departure.direction ASC;`,
      { stopId, date }
    )

    const result = await this.getBatched(query)

    return this.filterDeparturesByDayTypes(result, exceptionDayTypes)
  }

  async getDeparturesForTerminal(terminalId, date): Promise<JoreDepartureWithOrigin[]> {
    const exceptionDayTypes = await this.getDayTypesForDate(date)
    const dayTypes = uniq(flatten(Object.values(exceptionDayTypes)))

    const query = this.db.raw(
      `
      SELECT ${this.departureFields},
            stop.terminal_id,
            origin_departure.stop_id as origin_stop_id,
            origin_departure.hours as origin_hours,
            origin_departure.minutes as origin_minutes,
            origin_departure.is_next_day as origin_is_next_day,
            origin_departure.is_next_day as origin_is_next_day,
            origin_departure.extra_departure as origin_extra_departure,
            origin_departure.departure_id as origin_departure_id,
            origin_departure.date_begin as origin_date_begin,
            origin_departure.date_end as origin_date_end
      FROM jore.stop stop
        LEFT JOIN jore.departure departure USING (stop_id)
        ${this.originDepartureQueryFragment}
      WHERE stop.terminal_id = :terminalId
        AND departure.day_type IN (${dayTypes.map((dayType) => `'${dayType}'`).join(',')})
      ORDER BY departure.hours ASC,
               departure.minutes ASC,
               departure.route_id ASC,
               departure.direction ASC;`,
      { terminalId, date }
    )

    const result = await this.getBatched(query)
    return this.filterDeparturesByDayTypes(result, exceptionDayTypes)
  }

  async getDeparturesForRoute(
    stopId,
    routeId,
    direction,
    date
  ): Promise<JoreDepartureWithOrigin[]> {
    const dayTypes = await this.getDayTypesForDateAndRoute(date, routeId)

    const query = this.db.raw(
      `
SELECT ${this.departureFields}
FROM jore.departure departure
WHERE departure.stop_id = :stopId
  AND departure.route_id = :routeId
  AND departure.direction = :direction
  AND departure.day_type IN (${dayTypes.map((dayType) => `'${dayType}'`).join(',')})
ORDER BY departure.hours ASC,
         departure.minutes ASC;`,
      { stopId, routeId, direction: direction + '' }
    )

    return this.getBatched(query)
  }

  async getWeeklyDepartures(
    stopId,
    routeId,
    direction,
    exceptionDayTypes: string[] = [],
    lastStopArrival = false
  ): Promise<JoreDeparture[]> {
    const queryDayTypes = uniq(exceptionDayTypes.concat(dayTypes))

    let query

    if (!lastStopArrival) {
      query = this.db.raw(
        `
SELECT ${this.departureFields}
FROM jore.departure departure
WHERE departure.stop_id = :stopId
  AND departure.route_id = :routeId
  AND departure.direction = :direction
  AND departure.day_type IN (${queryDayTypes.map((dayType) => `'${dayType}'`).join(',')});`,
        {
          stopId,
          routeId,
          direction: direction + '',
        }
      )
    } else {
      query = this.db.raw(
        `
SELECT ${this.departureFields},
      origin_departure.stop_id as origin_stop_id,
      origin_departure.hours as origin_hours,
      origin_departure.minutes as origin_minutes,
      origin_departure.is_next_day as origin_is_next_day,
      origin_departure.is_next_day as origin_is_next_day,
      origin_departure.extra_departure as origin_extra_departure,
      origin_departure.departure_id as origin_departure_id
FROM jore.departure departure
    ${this.originDepartureQueryFragment}
WHERE departure.stop_id = :stopId
  AND departure.route_id = :routeId
  AND departure.direction = :direction
  AND departure.day_type IN (${queryDayTypes.map((dayType) => `'${dayType}'`).join(',')});`,
        {
          stopId,
          routeId,
          direction: direction + '',
        }
      )
    }

    return this.getBatched(query)
  }

  async getExceptionDaysForYear(year): Promise<JoreExceptionDay[] | null> {
    if (!year) {
      return null
    }

    const startDate = format(startOfYear(year), 'YYYY-MM-DD')
    const endDate = format(endOfYear(year), 'YYYY-MM-DD')

    const query = this.db.raw(
      `
      SELECT ex_day.date_in_effect,
             ex_desc.description,
             ex_day.day_type,
             ex_day.exclusive,
             rep_day.scope,
             rep_day.time_begin,
             rep_day.time_end,
             CASE
                 WHEN rep_day.replacing_day_type IS NULL
                     THEN ARRAY [ex_day.exception_day_type, ex_day.day_type]
                 ELSE ARRAY [ex_day.exception_day_type, rep_day.replacing_day_type]
                 END                       effective_day_types,
             rep_day.replacing_day_type as scoped_day_type
      FROM jore.exception_days_calendar ex_day
               LEFT OUTER JOIN jore.exception_days ex_desc
                               ON ex_day.exception_day_type = ex_desc.exception_day_type
               FULL OUTER JOIN jore.replacement_days_calendar rep_day USING (date_in_effect)
      WHERE ex_day.date_in_effect >= :startDate
        AND ex_day.date_in_effect <= :endDate
      ORDER BY ex_day.date_in_effect ASC;
      `,
      { startDate, endDate }
    )

    return this.getBatched(query)
  }

  async getExceptions(date): Promise<ExceptionDay[]> {
    const fetchExceptions: CachedFetcher<ExceptionDay[]> = async (year) => {
      const exceptionDays = await this.getExceptionDaysForYear(year)

      if (!exceptionDays) {
        return false
      }

      const exceptionDayObjects = exceptionDays.reduce(
        (days: ExceptionDay[], day: JoreExceptionDay) => {
          const dayObject = createExceptionDayObject(day)

          if (dayObject) {
            days.push(dayObject)
          }

          return days
        },
        []
      )

      const orderedDays = orderBy(exceptionDayObjects, 'exceptionDate')
      return orderedDays.filter((day) => isSameYear(day.exceptionDate, year))
    }

    const queryYear = getYear(date) + ''
    const cacheKey = `exception_days_${queryYear}`
    const exceptionDays = await cacheFetch<ExceptionDay[]>(
      cacheKey,
      () => fetchExceptions(queryYear),
      24 * 60 * 60
    )

    if (!exceptionDays) {
      return []
    }

    if (date && date.length > 4) {
      return exceptionDays.filter(({ exceptionDate }) => isEqual(exceptionDate, date))
    }

    return exceptionDays
  }

  async getDayTypesForDate(date: string): Promise<ExceptionDaysScoped> {
    const exceptions = await this.getExceptions(date)
    let dayTypes: ExceptionDaysScoped = { normal: [getDayTypeFromDate(date)] }

    if (exceptions && exceptions.length !== 0) {
      dayTypes = exceptions.reduce((exceptionDayTypes: ExceptionDaysScoped, exception) => {
        const currentScope = exception.scope || 'all'
        let scopeValue = exceptionDayTypes[currentScope] || []
        let allScopeValue = (currentScope !== 'all' ? exceptionDayTypes.all : scopeValue) || []

        const nonScopedDayTypes = exception.effectiveDayTypes.filter(
          (dt) => dt !== exception.scopedDayType
        )

        scopeValue = uniq(compact([...scopeValue, exception.scopedDayType]))
        allScopeValue = uniq([...allScopeValue, ...nonScopedDayTypes])

        exceptionDayTypes[currentScope] = scopeValue
        exceptionDayTypes.all = allScopeValue

        return exceptionDayTypes
      }, dayTypes)
    }

    return dayTypes
  }

  async getDayTypesForDateAndRoute(date: string, routeId: string): Promise<string[]> {
    const routeType = await this.getTypeOfRoute(routeId, date)
    const exceptionTypesScoped = await this.getDayTypesForDate(date)

    const exceptionTypesForScope = (!!routeType ? exceptionTypesScoped[routeType] : []) || []
    const exceptionTypesForAll = exceptionTypesScoped.all || []

    // If there are no scoped replacement days, also include the normal day type.
    // Otherwise some departures may be missing from the result as non-scoped
    // exception days may not have any departures.
    const includedNormalDays =
      exceptionTypesForScope.length === 0 ? exceptionTypesScoped.normal : []

    return uniq([...exceptionTypesForScope, ...exceptionTypesForAll, ...includedNormalDays])
  }

  async getTypeOfRoute(routeId: string, date: string): Promise<null | string> {
    const query = this.db.raw(
      `
      SELECT route.date_begin,
             route.date_end,
             route.type
      FROM jore.route route
      WHERE route.route_id = :routeId
        AND route.date_begin <= :date
        AND route.date_end >= :date
      ORDER BY route.date_imported DESC
      LIMIT 1;
      `,
      { routeId, date }
    )

    const result: Array<{ type: string }> = await this.getBatched(query)

    if (!result || result.length === 0) {
      return null
    }

    return result[0].type
  }
}
