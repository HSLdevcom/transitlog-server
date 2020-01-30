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
      SELECT
        route.route_id,
        route.direction,
        route.destination_fi,
        route.destinationstop_id,
        route.origin_fi,
        route.originstop_id,
        route.name_fi,
        route.name_fi as route_name,
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
      SELECT
        route.route_id,
        route.direction,
        route.destination_fi,
        route.destinationstop_id,
        route.origin_fi,
        route.originstop_id,
        route.name_fi,
        route.name_fi as route_name,
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
      `SELECT
        route.route_id,
        route.direction,
        route.route_length,
        jore.route_mode(route) as mode,
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
      `SELECT
       route_data.route_id,
       route_data.direction,
       route_data.originstop_id,
       route_data.route_length,
       route_data.route_name,
       route_data.origin_fi,
       route_data.destination_fi,
       route_data.mode,
       route_data.date_begin,
       route_data.date_end,
       route_data.timing_stop_type,
       route_data.stop_index,
       route_data.date_modified,
       stop.lat,
       stop.lon,
       stop.stop_id,
       stop.short_id,
       stop.name_fi,
       stop.stop_radius
FROM jore.stop stop
     LEFT JOIN (
        SELECT route.route_id,
               route.direction,
               route.originstop_id,
               route.route_length,
               route.name_fi as route_name,
               jore.route_mode(route) as mode,
               route.origin_fi,
               route.destination_fi,
               route_segment.stop_id,
               route_segment.date_begin,
               route_segment.date_end,
               route_segment.timing_stop_type,
               route_segment.stop_index,
               route_segment.date_modified
        FROM jore.route_segment route_segment,
             jore.route_segment_route(route_segment, :date) route
     ) route_data ON stop.stop_id = route_data.stop_id
WHERE stop.stop_id = :stopId;`,
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

  async getStops(date?: string): Promise<JoreStop[]> {
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
                order by inner_route_segment.route_id, inner_route_segment.stop_id, inner_route_segment.timing_stop_type DESC, inner_route_segment.date_modified DESC
           ) route_segment USING (stop_id),
           jore.route_segment_route(route_segment, :date) route;`,
          { date }
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
      FROM jore.stop stop;
    `
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
     LEFT OUTER JOIN jore.stop stop USING (stop_id),
     jore.route_segment_route(route_segment, :date) route
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

  async getDepartureStops(stopId, date): Promise<JoreStopSegment[]> {
    if (!stopId) {
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
       route.destination_fi,
       route.origin_fi,
       route.route_length,
       route.name_fi as route_name,
       jore.route_mode(route) as mode
FROM jore.route_segment route_segment
     LEFT OUTER JOIN jore.stop stop USING (stop_id),
     jore.route_segment_route(route_segment, null) route
WHERE route_segment.stop_id = :stopId;`,
      { stopId, date }
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
      route.type as type
FROM jore.departure departure
    LEFT OUTER JOIN jore.departure_origin_departure(departure) origin_departure ON true
    LEFT OUTER JOIN (SELECT
        inner_route.route_id,
        inner_route.direction,
        inner_route.type
      FROM jore.route inner_route
      WHERE inner_route.date_begin <= :date
        AND inner_route.date_end >= :date
      ORDER BY inner_route.date_imported) route ON departure.route_id = route.route_id AND departure.direction = route.direction
WHERE departure.stop_id = :stopId
  AND departure.day_type IN (${dayTypes.map((dayType) => `'${dayType}'`).join(',')})
ORDER BY departure.hours ASC,
         departure.minutes ASC,
         departure.route_id ASC,
         departure.direction ASC;`,
      { stopId, date }
    )

    const result = await this.getBatched(query)

    return result.filter((departure) => {
      const departureMode = departure.type

      const exceptionDaysForAll = exceptionDayTypes.all || []
      const exceptionDaysForMode =
        (departureMode ? exceptionDayTypes[departureMode] : []) || []

      const filterByDayTypes =
        exceptionDaysForMode.length !== 0
          ? exceptionDaysForMode
          : exceptionDayTypes.normal || []

      const matchDayTypes = [...exceptionDaysForAll, ...filterByDayTypes]
      return matchDayTypes.includes(departure.day_type)
    })
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
    LEFT OUTER JOIN jore.departure_origin_departure(departure) origin_departure ON true
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
   CASE WHEN rep_day.replacing_day_type
        IS NULL THEN ARRAY [ex_day.exception_day_type, ex_day.day_type]
        ELSE ARRAY [ex_day.exception_day_type, rep_day.replacing_day_type]
   END effective_day_types,
   rep_day.replacing_day_type as scoped_day_type
FROM jore.exception_days_calendar ex_day
     LEFT OUTER JOIN jore.exception_days ex_desc
                     ON ex_day.exception_day_type = ex_desc.exception_day_type
     FULL OUTER JOIN jore.replacement_days_calendar rep_day USING (date_in_effect)
WHERE ex_day.date_in_effect >= :startDate AND
      ex_day.date_in_effect <= :endDate
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
      SELECT
        route.date_begin,
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
