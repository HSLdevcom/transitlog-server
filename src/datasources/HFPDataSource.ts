import { get } from 'lodash'
import moment from 'moment-timezone'
import { TZ } from '../constants'
import { Vehicles } from '../types/generated/hfp-types'
import { ROUTE_WEEK_DEPARTURES_EVENTS_QUERY } from '../queries/departureQueries'
import { isNextDay } from '../utils/time'
import { Direction } from '../types/generated/schema-types'
import Knex from 'knex'
import SQLDataSource from '../utils/SQLDataSource'

const knex: Knex = Knex({
  dialect: 'postgres',
  client: 'pg',
  connection: process.env.HFP_PG_CONNECTION_STRING,
  searchPath: ['knex', 'public'],
  pool: {
    min: 1,
    max: 20,
  },
})

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
WHERE oday = :date AND geohash_level = 0
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

  async getDepartureEvents(stopId: string, date: string) {
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
  ) {
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
  ) {
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
}
