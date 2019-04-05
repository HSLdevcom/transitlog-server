import {
  JoreRoute,
  JoreLine,
  JoreStop,
  JoreEquipment,
  JoreDeparture,
  JoreRouteData,
  JoreRouteDepartureData,
  JoreDepartureWithOrigin,
} from '../types/Jore'
import { Direction } from '../types/generated/schema-types'
import { getDayTypeFromDate } from '../utils/getDayTypeFromDate'
import { filterByDateChains } from '../utils/filterByDateChains'
import Knex from 'knex'
import { get } from 'lodash'
import SQLDataSource from '../utils/SQLDataSource'
import { JourneyRouteData } from '../app/createJourneyResponse'

const knex: Knex = Knex({
  dialect: 'postgres',
  client: 'pg',
  connection: process.env.PG_CONNECTION_STRING,
  pool: {
    min: 1,
    max: 20,
  },
})

const SCHEMA = 'jore'

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
    const query = this.db
      .select()
      .from(this.db.raw(`:schema:.route, :schema:.route_line(route)`, { schema: SCHEMA }))

    return this.getBatched(query)
  }

  async getRouteGeometry(
    routeId: string,
    direction: Direction,
    date: string
  ): Promise<JoreRoute[]> {
    const query = this.db.raw(
      `SELECT route.date_begin, route.date_end, geometry.geometry
from :schema:.route as route,
     :schema:.route_geometries(route, :date) as geometry
where route_id = :routeId
  and direction = :direction`,
      { schema: SCHEMA, routeId, direction: direction + '', date }
    )

    return this.getBatched(query)
  }

  async getStopSegments(stopId: string, date: string): Promise<JoreStop[]> {
    const query = this.db.raw(
      `SELECT *
FROM :schema:.stop as stop,
     :schema:.stop_route_segments_for_date(stop, :date) as route_segment,
     :schema:.route_segment_line(route_segment) as line,
     :schema:.route_segment_route(route_segment, :date) as route
where stop.stop_id = :stopId;`,
      { schema: SCHEMA, stopId, date }
    )

    return this.getBatched(query)
  }

  async getStops(): Promise<JoreStop[]> {
    const query = this.db
      .withSchema(SCHEMA)
      .select()
      .from('stop')

    return this.getBatched(query)
  }

  async getStopsByBBox(bbox): Promise<JoreStop[]> {
    const query = this.db.select().from(
      this.db.raw(`:schema:.stops_by_bbox(:minLat, :minLng, :maxLat, :maxLng)`, {
        schema: SCHEMA,
        ...bbox,
      })
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
       route.destination_fi,
       route.origin_fi,
       route.destinationstop_id,
       route.originstop_id,
       line.line_id,
       route_segment.next_stop_id,
       route_segment.date_begin,
       route_segment.date_end,
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

  async getRouteIndex(routeId: string, direction: Direction): Promise<JoreRoute[]> {
    const query = this.db.raw(
      `
      SELECT
        route.route_id,
        line.line_id,
        route.direction,
        route.destination_fi,
        route.origin_fi,
        route.originstop_id,
        route.name_fi,
        route.date_begin,
        route.date_end
      FROM :schema:.route route, :schema:.route_line(route) line
      WHERE route.route_id = :routeId
        AND route.direction = :direction;
      `,
      { schema: SCHEMA, routeId, direction: direction + '' }
    )

    return this.getBatched(query)
  }

  async getJourneyDepartures(
    routeId: string,
    direction: Direction,
    dateBegin: string,
    dateEnd: string,
    date: string
  ): Promise<JoreRouteDepartureData[] | null> {
    // TODO: query with exception and replacement day types
    const dayTypes = [getDayTypeFromDate(date)]
    const query = this.db.raw(
      `
    SELECT
       route_segment.next_stop_id,
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
       stop.stop_radius,
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
FROM :schema:.route route
    LEFT OUTER JOIN :schema:.route_segment route_segment
                    ON route.route_id = route_segment.route_id
                        AND route.direction = route_segment.direction
                        AND route.date_begin <= route_segment.date_end
                        AND route.date_end >= route_segment.date_begin
    LEFT OUTER JOIN (
                        SELECT *
                        FROM :schema:.departure
                        WHERE day_type IN (${dayTypes.map((dayType) => `'${dayType}'`).join(',')})
                    ) departure
                    ON route_segment.route_id = departure.route_id
                        AND route_segment.direction = departure.direction
                        AND route_segment.stop_id = departure.stop_id
                        AND route_segment.date_begin <= departure.date_end
                        AND route_segment.date_end >= departure.date_begin
    LEFT OUTER JOIN :schema:.stop stop
                    ON departure.stop_id = stop.stop_id
    WHERE route.route_id = :routeId
      AND route.direction = :direction
      AND route.date_begin = :dateBegin
      AND route.date_end = :dateEnd
ORDER BY route_segment.stop_index ASC,
         departure.hours ASC,
         departure.minutes ASC,
         departure.departure_id ASC;`,
      { schema: SCHEMA, routeId, direction: direction + '', dateBegin, dateEnd }
    )

    return this.getBatched(query)
  }

  async getDepartureData(routeId, direction, date): Promise<JourneyRouteData> {
    const availableRoutes = await this.getRouteIndex(routeId, direction)

    if (!availableRoutes || availableRoutes.length === 0) {
      return { route: null, departures: [] }
    }

    const validRoutes = filterByDateChains<JoreRoute>([availableRoutes], date)

    if (validRoutes.length === 0) {
      return { route: null, departures: [] }
    }

    const route = validRoutes[0]

    const departures = await this.getJourneyDepartures(
      route.route_id,
      route.direction,
      route.date_begin,
      route.date_end,
      date
    )

    if (!departures) {
      return { route, departures: [] }
    }

    return { route, departures }
  }

  async getDepartureStop(stopId): Promise<JoreStop | null> {
    if (!stopId) {
      return null
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
       line.line_id
FROM :schema:.stop stop
     LEFT OUTER JOIN :schema:.route_segment route_segment USING (stop_id),
     :schema:.route_segment_route(route_segment, null) route,
     :schema:.route_line(route) line
WHERE stop.stop_id = :stopId;`,
      { schema: SCHEMA, stopId }
    )

    return this.getBatched(query)
  }

  async getDepartures(stopId, date): Promise<JoreDepartureWithOrigin[]> {
    // TODO: query with exception and replacement day types
    const dayTypes = [getDayTypeFromDate(date)]
    const query = this.db.raw(
      `
SELECT departure.route_id,
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

  async getExceptionDaysForYear(year) {
    if (!year) {
      return null
    }

    return {}
  }
}
