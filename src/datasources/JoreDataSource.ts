import {
  JoreRoute,
  JoreLine,
  JoreStop,
  JoreEquipment,
  JoreRouteSegment,
  JoreDeparture,
} from '../types/Jore'
import { Direction } from '../types/generated/schema-types'
import { getDayTypeFromDate } from '../utils/getDayTypeFromDate'
import { filterByDateChains } from '../utils/filterByDateChains'
import Knex from 'knex'
import SQLDataSource from '../utils/SQLDataSource'

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

  async getRouteSegments(routeId: string, direction: Direction): Promise<JoreRouteSegment[]> {
    const query = this.db.raw(
      `select route.originstop_id,
       route.date_begin as route_date_begin,
       route.date_end   as route_date_end,
       route.origin_fi,
       route.destination_fi,
       line.line_id,
       route_segment.*,
       stop.*
FROM :schema:.route AS route,
     :schema:.route_line(route) as line,
     :schema:.route_route_segments(route) AS route_segment
LEFT OUTER JOIN :schema:.stop AS stop ON stop.stop_id = route_segment.stop_id
WHERE route.route_id = :routeId AND route.direction = :direction;`,
      { schema: SCHEMA, routeId, direction: direction + '' }
    )

    return this.getBatched(query)
  }

  async getRouteIndex(routeId: string, direction: Direction): Promise<JoreRoute[]> {
    return []
  }

  async getJourneyRoute(
    routeId: string,
    direction: Direction,
    dateBegin: string,
    dateEnd: string,
    date: string
  ): Promise<JoreRoute | null> {
    const dayType = getDayTypeFromDate(date)
    return null
  }

  async getFullRoute(routeId, direction, date): Promise<JoreRoute | null> {
    const availableRoutes = await this.getRouteIndex(routeId, direction)

    if (!availableRoutes || availableRoutes.length === 0) {
      return null
    }

    const validRoutes = filterByDateChains<JoreRoute>([availableRoutes], date)

    if (validRoutes.length === 0) {
      return null
    }

    const route = validRoutes[0]
    return this.getJourneyRoute(
      route.route_id,
      route.direction,
      route.date_begin,
      route.date_end,
      date
    )
  }

  async getDepartureStop(stopId): Promise<JoreStop | null> {
    if (!stopId) {
      return null
    }

    return null
  }

  async getDepartures(stopId, date): Promise<JoreDeparture[]> {
    const dayType = getDayTypeFromDate(date)
    return []
  }

  async getExceptionDaysForYear(year) {
    if (!year) {
      return null
    }

    return {}
  }
}
