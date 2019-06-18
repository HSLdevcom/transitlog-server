import {
  JoreRoute,
  JoreLine,
  JoreStop,
  JoreEquipment,
  JoreRouteData,
  JoreRouteDepartureData,
  JoreDepartureWithOrigin,
  JoreExceptionDay,
  JoreStopSegment,
  JoreDeparture,
} from '../types/Jore'
import { Direction, ExceptionDay } from '../types/generated/schema-types'
import { dayTypes, getDayTypeFromDate } from '../utils/dayTypes'
import { orderBy, uniq } from 'lodash'
import SQLDataSource from '../utils/SQLDataSource'
import { JourneyRouteData } from '../app/createJourneyResponse'
import { endOfYear, format, getYear, isEqual, isSameYear, startOfYear } from 'date-fns'
import { cacheFetch } from '../app/cache'
import { CachedFetcher } from '../types/CachedFetcher'
import { createExceptionDayObject } from '../app/objects/createExceptionDayObject'
import { getKnex } from '../knex'

const knex = getKnex()

const SCHEMA = 'jore'
const ONE_DAY = 24 * 60 * 60

// install postgis functions in knex.postgis;
const st = require('knex-postgis')(knex)

export class JoreDataSource extends SQLDataSource {
  constructor() {
    super()
    // Add your instance of Knex to the DataSource
    this.knex = knex
  }

  async getLines(): Promise<JoreLine[]> {
    const query = this.db
      .withSchema(SCHEMA)
      .select()
      .from('line')

    return this.getBatched(query)
  }

  async getRoutes(): Promise<JoreRoute[]> {
    const query = this.db.raw(
      `
      SELECT
        route.route_id,
        line.line_id,
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
        mode.mode
      FROM :schema:.route route,
           :schema:.route_mode(route) mode,
           :schema:.route_line(route) line;
    `,
      { schema: SCHEMA }
    )

    return this.getBatched(query)
  }

  async getRoute(routeId, direction): Promise<JoreRoute[]> {
    const query = this.db.raw(
      `
      SELECT
        route.route_id,
        line.line_id,
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
        mode.mode
      FROM :schema:.route route,
           :schema:.route_mode(route) mode,
           :schema:.route_line(route) line
      WHERE route.route_id = :routeId
        AND route.direction = :direction;
    `,
      { schema: SCHEMA, routeId, direction: direction + '' }
    )

    return this.getBatched(query)
  }

  async getRouteGeometry(
    routeId: string,
    direction: Direction,
    date: string
  ): Promise<JoreRoute[]> {
    const query = this.db.raw(
      `SELECT
        route.date_begin,
        route.date_end,
        route.date_modified,
        mode.mode,
        geometry.geometry
from :schema:.route route,
     :schema:.route_mode(route) mode,
     :schema:.route_geometries(route, :date) geometry
where route_id = :routeId
  and direction = :direction`,
      { schema: SCHEMA, routeId, direction: direction + '', date }
    )

    return this.getBatched(query)
  }

  async getStopSegments(stopId: string, date: string): Promise<JoreRouteData[]> {
    const query = this.db.raw(
      `SELECT
       route.route_id,
       route.direction,
       route.originstop_id,
       route.name_fi as route_name,
       line.line_id,
       mode.mode,
       route_segment.date_begin,
       route_segment.date_end,
       route_segment.timing_stop_type,
       route_segment.stop_index,
       route_segment.date_modified,
       stop.lat,
       stop.lon,
       stop.stop_id,
       stop.short_id,
       stop.name_fi,
       stop.stop_radius
FROM :schema:.stop stop,
     :schema:.stop_route_segments_for_date(stop, :date) route_segment,
     :schema:.route_segment_line(route_segment) line,
     :schema:.route_segment_route(route_segment, :date) route,
     :schema:.route_mode(route) as mode
WHERE stop.stop_id = :stopId;`,
      { schema: SCHEMA, stopId, date }
    )

    return this.getBatched(query)
  }

  async getStops(date): Promise<JoreStop[]> {
    const query = date
      ? this.db.raw(
          `
      SELECT stop.stop_id,
             stop.short_id,
             stop.lat,
             stop.lon,
             stop.name_fi,
             stop.stop_radius,
             route_segment.date_begin,
             route_segment.date_end,
             route_segment.date_modified,
             route_segment.route_id,
             route_segment.direction,
             route_segment.timing_stop_type,
             modes.modes
      FROM :schema:.stop stop,
           :schema:.stop_route_segments_for_date(stop, :date) route_segment,
           :schema:.stop_modes(stop, :date) modes;
    `,
          { schema: SCHEMA, date }
        )
      : this.db.raw(
          `
      SELECT stop.stop_id,
             stop.short_id,
             stop.lat,
             stop.lon,
             stop.name_fi,
             stop.stop_radius,
             modes.modes
      FROM :schema:.stop stop, :schema:.stop_modes(stop, null) modes;
    `,
          { schema: SCHEMA }
        )

    return this.getBatched(query)
  }

  async getEquipment(): Promise<JoreEquipment[]> {
    const query = this.db
      .withSchema(SCHEMA)
      .select()
      .from('equipment')

    return this.getBatched(query)
  }

  async getEquipmentById(vehicleId: string | number, operatorId: string): Promise<JoreEquipment[]> {
    const joreVehicleId = vehicleId + ''
    const joreOperatorId = (operatorId + '').padStart(4, '0')

    const query = this.db
      .withSchema(SCHEMA)
      .select()
      .from('equipment')
      .where({ vehicle_id: joreVehicleId, operator_id: joreOperatorId })

    return this.getBatched(query)
  }

  async getRouteSegments(
    routeId: string,
    direction: Direction,
    dateBegin?: string,
    dateEnd?: string
  ): Promise<JoreRouteData[]> {
    const query = this.db.raw(
      `select route.route_id,
       route.direction,
       route.name_fi,
       route.name_fi as route_name,
       route.destination_fi,
       route.origin_fi,
       route.destinationstop_id,
       route.originstop_id,
       mode.mode,
       line.line_id,
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
FROM :schema:.route route,
     :schema:.route_mode(route) mode,
     :schema:.route_line(route) line,
     :schema:.route_route_segments(route) route_segment
LEFT OUTER JOIN :schema:.stop stop ON stop.stop_id = route_segment.stop_id
WHERE route.route_id = :routeId AND route.direction = :direction ${
        dateBegin && dateEnd
          ? this.db.raw(`AND route.date_begin = :dateBegin AND route.date_end = :dateEnd LIMIT 1`, {
              dateBegin,
              dateEnd,
            })
          : ''
      };`,
      { schema: SCHEMA, routeId, direction: direction + '' }
    )

    return this.getBatched(query)
  }

  async getJourneyDepartures(
    routeId: string,
    direction: Direction,
    date: string
  ): Promise<JoreRouteDepartureData[]> {
    const dayTypes = await this.getDayTypesForDate(date)

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
       departure.departure_id
FROM :schema:.departure departure
    WHERE day_type IN (${dayTypes.map((dayType) => `'${dayType}'`).join(',')})
      AND departure.route_id = :routeId
      AND departure.direction = :direction
      AND departure.date_begin <= :date
      AND departure.date_end >= :date
ORDER BY departure.departure_id ASC,
         departure.hours ASC,
         departure.minutes ASC;`,
      { schema: SCHEMA, routeId, direction: direction + '', date }
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
       route.name_fi as route_name,
       line.line_id,
       mode.mode
FROM :schema:.route_segment route_segment
     LEFT OUTER JOIN :schema:.stop stop USING (stop_id),
     :schema:.route_segment_route(route_segment, :date) route,
     :schema:.route_mode(route) mode,
     :schema:.route_line(route) line
WHERE route_segment.route_id = :routeId
  AND route_segment.direction = :direction;`,
      { schema: SCHEMA, routeId, direction: direction + '', date }
    )

    return this.getBatched(query)
  }

  async getDepartureData(routeId, direction, date): Promise<JourneyRouteData> {
    const stopsPromise = this.getJourneyStops(routeId, direction, date)
    const departuresPromise = this.getJourneyDepartures(routeId, direction, date)
    const [stops = [], departures = []] = await Promise.all([stopsPromise, departuresPromise])
    return { stops, departures }
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
       route.originstop_id,
       route.name_fi as route_name,
       line.line_id,
       mode.mode
FROM :schema:.stop stop
     LEFT OUTER JOIN :schema:.route_segment route_segment USING (stop_id),
     :schema:.route_segment_route(route_segment, :date) route,
     :schema:.route_mode(route) mode,
     :schema:.route_line(route) line
WHERE stop.stop_id = :stopId;`,
      { schema: SCHEMA, stopId, date }
    )

    return this.getBatched(query)
  }

  async getDayTypesForDate(date): Promise<string[]> {
    const exceptions = await this.getExceptions(date)
    let dayTypes: string[] = []

    if (exceptions && exceptions.length !== 0) {
      dayTypes = uniq(
        exceptions.reduce(
          (exceptionDayTypes: string[], { effectiveDayTypes }) => [
            ...exceptionDayTypes,
            ...effectiveDayTypes,
          ],
          []
        )
      )
    }

    if (dayTypes.length === 0) {
      dayTypes = [getDayTypeFromDate(date)]
    }

    return dayTypes
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
    departure.departure_id
  `

  async getDeparturesForStop(stopId, date): Promise<JoreDepartureWithOrigin[]> {
    const dayTypes = await this.getDayTypesForDate(date)
    const query = this.db.raw(
      `
SELECT ${this.departureFields},
      origin_departure.stop_id as origin_stop_id,
      origin_departure.hours as origin_hours,
      origin_departure.minutes as origin_minutes,
      origin_departure.is_next_day as origin_is_next_day,
      origin_departure.is_next_day as origin_is_next_day,
      origin_departure.extra_departure as origin_extra_departure,
      origin_departure.departure_id as origin_departure_id
FROM :schema:.departure departure
    LEFT OUTER JOIN :schema:.departure_origin_departure(departure) origin_departure ON true
WHERE departure.stop_id = :stopId
  AND departure.day_type IN (${dayTypes.map((dayType) => `'${dayType}'`).join(',')})
ORDER BY departure.hours ASC,
         departure.minutes ASC,
         departure.route_id ASC,
         departure.direction ASC;`,
      { schema: SCHEMA, stopId }
    )

    return this.getBatched(query)
  }

  async getDeparturesForRoute(
    stopId,
    routeId,
    direction,
    date
  ): Promise<JoreDepartureWithOrigin[]> {
    const dayTypes = await this.getDayTypesForDate(date)

    const query = this.db.raw(
      `
SELECT ${this.departureFields}
FROM :schema:.departure departure
WHERE departure.stop_id = :stopId
  AND departure.route_id = :routeId
  AND departure.direction = :direction
  AND departure.day_type IN (${dayTypes.map((dayType) => `'${dayType}'`).join(',')})
ORDER BY departure.hours ASC,
         departure.minutes ASC;`,
      { schema: SCHEMA, stopId, routeId, direction: direction + '' }
    )

    return this.getBatched(query)
  }

  async getWeeklyDepartures(
    stopId,
    routeId,
    direction,
    exceptionDayTypes: string[] = []
  ): Promise<JoreDeparture[]> {
    const queryDayTypes = uniq(exceptionDayTypes.concat(dayTypes))

    const query = this.db.raw(
      `
SELECT ${this.departureFields}
FROM :schema:.departure departure
WHERE departure.stop_id = :stopId
  AND departure.route_id = :routeId
  AND departure.direction = :direction
  AND departure.day_type IN (${queryDayTypes.map((dayType) => `'${dayType}'`).join(',')})
ORDER BY departure.hours ASC,
         departure.minutes ASC;`,
      {
        schema: SCHEMA,
        stopId,
        routeId,
        direction: direction + '',
      }
    )

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
   END effective_day_types
FROM :schema:.exception_days_calendar ex_day
     LEFT OUTER JOIN :schema:.exception_days ex_desc
                     ON ex_day.exception_day_type = ex_desc.exception_day_type
     FULL OUTER JOIN :schema:.replacement_days_calendar rep_day USING (date_in_effect)
WHERE ex_day.date_in_effect >= :startDate AND
      ex_day.date_in_effect <= :endDate
ORDER BY ex_day.date_in_effect ASC;
    `,
      { schema: SCHEMA, startDate, endDate }
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
}
