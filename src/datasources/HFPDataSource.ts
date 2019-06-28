import moment from 'moment-timezone'
import { TZ } from '../constants'
import { isNextDay } from '../utils/time'
import { Direction } from '../types/generated/schema-types'
import Knex from 'knex'
import SQLDataSource from '../utils/SQLDataSource'
import { DBAlert, DBCancellation, Vehicles } from '../types/EventsDb'
import { AlertSearchProps } from '../app/getAlerts'
import { databases, getKnex } from '../knex'

const knex: Knex = getKnex(databases.HFP)

const vehicleFields = [
  'mode',
  'owner_operator_id',
  'vehicle_number',
  'unique_vehicle_id',
  'route_id',
  'direction_id',
  'headsign',
  'journey_start_time',
  'next_stop_id',
  'geohash_level',
  'desi',
  'tst',
  'tsi',
  'spd',
  'hdg',
  'lat',
  'long',
  'dl',
  'drst',
  'oday',
]

const cancellationFields = [
  'id',
  'created_at',
  'modified_at',
  'status',
  'start_date',
  'route_id',
  'direction_id',
  'start_time',
  'last_modified',
  'data',
]

const alertFields = [
  'id',
  'created_at',
  'modified_at',
  'route_id',
  'stop_id',
  'affects_all_routes',
  'affects_all_stops',
  'valid_from',
  'valid_to',
  'last_modified',
  'data',
  'ext_id_bulletin',
]

export class HFPDataSource extends SQLDataSource {
  constructor() {
    super()
    // Add your instance of Knex to the DataSource
    this.knex = knex
  }

  async getAvailableVehicles(date): Promise<Vehicles[]> {
    const query = this.db.raw(
      `
SELECT distinct on (unique_vehicle_id) unique_vehicle_id,
vehicle_number,
owner_operator_id
FROM vehicles
WHERE oday = :date AND geohash_level = 4
ORDER BY (unique_vehicle_id);
`,
      { date }
    )

    return this.getBatched(query)
  }

  async getAreaJourneys(minTime, maxTime, bbox, date): Promise<Vehicles[]> {
    const { minLat, maxLat, minLng, maxLng } = bbox

    const query = this.db('vehicles')
      .select(vehicleFields)
      .where('oday', date)
      .where('geohash_level', '<=', 4)
      .whereBetween('tsi', [moment.tz(minTime, TZ).unix(), moment.tz(maxTime, TZ).unix()])
      .whereBetween('lat', [minLat, maxLat])
      .whereBetween('long', [minLng, maxLng])
      .orderBy('tsi', 'ASC')

    return this.getBatched(query)
  }

  async getJourneysForVehicle(uniqueVehicleId, date): Promise<Vehicles[]> {
    const [operatorPart, vehiclePart] = uniqueVehicleId.split('/')
    const operatorId = parseInt(operatorPart, 10)
    const vehicleId = parseInt(vehiclePart, 10)

    const queryVehicleId = `${operatorId}/${vehicleId}`

    const query = this.db('vehicles')
      .select(vehicleFields)
      .where('oday', date)
      .where('unique_vehicle_id', queryVehicleId)
      .orderBy('tst', 'ASC')

    return this.getBatched(query)
  }

  async getRouteJourneys(routeId, direction, date): Promise<Vehicles[]> {
    const query = this.db('vehicles')
      .select(vehicleFields)
      .where('oday', date)
      .where('geohash_level', '<=', 4)
      .where('route_id', routeId)
      .where('direction_id', direction)
      .orderBy('tst', 'ASC')

    return this.getBatched(query)
  }

  async getJourneyEvents(
    routeId,
    direction,
    departureDate,
    departureTime,
    uniqueVehicleId = ''
  ): Promise<Vehicles[]> {
    let operatorId
    let vehicleId

    if (uniqueVehicleId) {
      const [operatorPart, vehiclePart] = uniqueVehicleId.split('/')
      operatorId = parseInt(operatorPart, 10)
      vehicleId = parseInt(vehiclePart, 10)
    }

    let query = this.db('vehicles')
      .select(vehicleFields)
      .where('oday', departureDate)
      .where('route_id', routeId)
      .where('direction_id', direction)
      .where('journey_start_time', departureTime)
      .orderBy('tst', 'ASC')

    // TODO: Test without uniqueVehicleId
    if (uniqueVehicleId) {
      query = query.where('unique_vehicle_id', `${operatorId}/${vehicleId}`)
    }

    // TODO: Test next day departures
    if (isNextDay(departureTime)) {
      query = query.where('tst', '>', moment.tz(departureDate, TZ).toISOString())
    }

    let vehicles: Vehicles[] = await this.getBatched(query)

    if (!uniqueVehicleId && vehicles.length !== 0) {
      const firstVehicleId = vehicles[0].unique_vehicle_id
      vehicles = vehicles.filter((event) => event.unique_vehicle_id === firstVehicleId)
    }

    return vehicles
  }

  async getDepartureEvents(stopId: string, date: string): Promise<Vehicles[]> {
    const query = this.db('vehicles')
      .select(
        this.db.raw(
          `DISTINCT ON ("journey_start_time", "unique_vehicle_id") ${vehicleFields.join(',')}`
        )
      )
      .where('oday', date)
      .where('next_stop_id', stopId)
      .orderBy([
        { column: 'journey_start_time', order: 'asc' },
        { column: 'unique_vehicle_id', order: 'asc' },
        { column: 'tst', order: 'desc' },
      ])

    return this.getBatched(query)
  }

  async getRouteDepartureEvents(
    stopId: string,
    date: string,
    routeId: string,
    direction: Direction
  ): Promise<Vehicles[]> {
    const query = this.db('vehicles')
      .select(
        this.db.raw(
          `DISTINCT ON ("journey_start_time", "unique_vehicle_id") ${vehicleFields.join(',')}`
        )
      )
      .where('oday', date)
      .where('next_stop_id', stopId)
      .where('route_id', routeId)
      .where('direction_id', direction)
      .orderBy([
        { column: 'journey_start_time', order: 'asc' },
        { column: 'unique_vehicle_id', order: 'asc' },
        { column: 'tst', order: 'desc' },
      ])

    return this.getBatched(query)
  }

  async getWeeklyDepartureEvents(
    stopId: string,
    date: string,
    routeId: string,
    direction: Direction
  ): Promise<Vehicles[]> {
    const minDateMoment = moment.tz(date, TZ).startOf('isoWeek')
    const maxDateMoment = minDateMoment.clone().endOf('isoWeek')

    const query = this.db('vehicles')
      .select(
        this.db.raw(
          `DISTINCT ON ("oday", "journey_start_time", "unique_vehicle_id") ${vehicleFields.join(
            ','
          )}`
        )
      )
      .whereBetween('oday', [
        minDateMoment.format('YYYY-MM-DD'),
        maxDateMoment.format('YYYY-MM-DD'),
      ])
      .where('next_stop_id', stopId)
      .where('route_id', routeId)
      .where('direction_id', direction)
      .orderBy([
        { column: 'oday', order: 'asc' },
        { column: 'journey_start_time', order: 'asc' },
        { column: 'unique_vehicle_id', order: 'asc' },
        { column: 'tst', order: 'desc' },
      ])

    return this.getBatched(query)
  }

  getAlerts = async (dateTime: string, alertSearchProps: AlertSearchProps): Promise<DBAlert[]> => {
    let query = this.db('alert')
      .select(alertFields)
      .where('valid_from', '<=', dateTime)
      .where('valid_to', '>=', dateTime)
      .orderBy([
        { column: 'valid_from', order: 'asc' },
        { column: 'valid_to', order: 'desc' },
        { column: 'last_modified', order: 'desc' },
      ])

    const { all, network, allRoutes, allStops, route: routeId, stop: stopId } = alertSearchProps

    if (all) {
      return this.getBatched(query)
    }

    if (network) {
      query = query.where('affects_all_routes', true).where('affects_all_stops', true)
    }

    if (routeId) {
      if (Array.isArray(routeId)) {
        query = query.whereIn('route_id', routeId)
      } else {
        query = query.where('route_id', routeId)
      }

      query = query.orWhere('affects_all_routes', true)
    }

    if (stopId) {
      if (Array.isArray(stopId)) {
        query = query.whereIn('stop_id', stopId)
      } else {
        query = query.where('stop_id', stopId)
      }

      query = query.orWhere('affects_all_stops', true)
    }

    if (allStops) {
      query = query.where('affects_all_stops', true)
    }

    if (allRoutes) {
      query = query.where('affects_all_routes', true)
    }

    return this.getBatched(query)
  }

  getCancellations = async (
    date: string,
    routeId?: string,
    direction?: number,
    departureTime?: string
  ): Promise<DBCancellation[]> => {
    let query = this.db('cancellation')
      .select(cancellationFields)
      .where('start_date', date)
      .orderBy([{ column: 'last_modified', order: 'desc' }, { column: 'start_time', order: 'asc' }])

    if (routeId) {
      query = query.where('route_id', routeId)

      if (direction) {
        query = query.where('direction_id', direction)
      }

      if (departureTime) {
        query = query.where('start_time', 'LIKE', departureTime + '%')
      }
    }

    return this.getBatched(query)
  }
}
