import { get } from 'lodash'
import moment from 'moment-timezone'
import { TZ } from '../constants'
import { Vehicles } from '../types/generated/hfp-types'
import {
  JOURNEY_EVENTS_QUERY,
  ROUTE_JOURNEY_EVENTS_QUERY,
  VEHICLE_JOURNEYS_QUERY,
} from '../queries/journeyQueries'
import {
  DEPARTURE_EVENTS_QUERY,
  ROUTE_DEPARTURES_EVENTS_QUERY,
  ROUTE_WEEK_DEPARTURES_EVENTS_QUERY,
} from '../queries/departureQueries'
import { getNormalTime, isNextDay } from '../utils/time'
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

export class HFPDataSource extends SQLDataSource {
  constructor() {
    super()
    // Add your instance of Knex to the DataSource
    this.knex = knex
  }

  // Mock method to satisfy the compiler before I've had a chance to rewrite all functions
  query(one, two) {
    return {}
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

  vehicleFields = [
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

  async getAreaJourneys(minTime, maxTime, bbox, date): Promise<Vehicles[]> {
    const { minLat, maxLat, minLng, maxLng } = bbox

    const query = this.db('vehicles')
      .select(this.vehicleFields)
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
      .select(this.vehicleFields)
      .where('oday', date)
      .where('unique_vehicle_id', queryVehicleId)
      .orderBy('tst', 'ASC')

    return this.getBatched(query)
  }

  async getRouteJourneys(routeId, direction, date): Promise<Vehicles[]> {
    const query = this.db('vehicles')
      .select(this.vehicleFields)
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
      .select(this.vehicleFields)
      .where('oday', departureDate)
      .where('route_id', routeId)
      .where('direction_id', direction)
      .where('journey_start_time', departureTime)
      .orderBy('tst', 'ASC')

    if (uniqueVehicleId) {
      query = query.where('unique_vehicle_id', `${operatorId}/${vehicleId}`)
    }

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
    const response = await this.query(DEPARTURE_EVENTS_QUERY, {
      variables: {
        stopId,
        date,
      },
    })

    return get(response, 'data.vehicles', [])
  }

  async getRouteDepartureEvents(
    stopId: string,
    date: string,
    routeId: string,
    direction: Direction
  ) {
    const response = await this.query(ROUTE_DEPARTURES_EVENTS_QUERY, {
      variables: {
        stopId,
        date,
        routeId,
        direction,
      },
    })

    return get(response, 'data.vehicles', [])
  }

  async getWeeklyDepartureEvents(
    stopId: string,
    date: string,
    routeId: string,
    direction: Direction
  ) {
    const minDateMoment = moment.tz(date, TZ).startOf('isoWeek')
    const maxDateMoment = minDateMoment.clone().endOf('isoWeek')

    const response = await this.query(ROUTE_WEEK_DEPARTURES_EVENTS_QUERY, {
      variables: {
        stopId,
        minDate: minDateMoment.format('YYYY-MM-DD'),
        maxDate: maxDateMoment.format('YYYY-MM-DD'),
        routeId,
        direction,
      },
    })

    return get(response, 'data.vehicles', [])
  }
}
