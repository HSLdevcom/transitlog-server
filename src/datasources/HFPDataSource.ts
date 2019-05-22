import { get } from 'lodash'
import moment from 'moment-timezone'
import { TZ } from '../constants'
import { Vehicles } from '../types/generated/hfp-types'
import { AVAILABLE_VEHICLES_QUERY } from '../queries/vehicleQueries'
import {
  AREA_EVENTS_QUERY,
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

  async getAreaJourneys(minTime, maxTime, bbox, date): Promise<Vehicles[]> {
    const response = await this.query(AREA_EVENTS_QUERY, {
      variables: { minTime, maxTime, date, ...bbox },
    })
    return get(response, 'data.vehicles', [])
  }

  async getJourneysForVehicle(uniqueVehicleId, date): Promise<Vehicles[]> {
    const [operatorPart, vehiclePart] = uniqueVehicleId.split('/')
    const operatorId = parseInt(operatorPart, 10)
    const vehicleId = parseInt(vehiclePart, 10)

    const response = await this.query(VEHICLE_JOURNEYS_QUERY, {
      variables: {
        date,
        uniqueVehicleId: `${operatorId}/${vehicleId}`,
      },
    })

    return get(response, 'data.vehicles', [])
  }

  async getRouteJourneys(routeId, direction, date): Promise<Vehicles[]> {
    const response = await this.query(ROUTE_JOURNEY_EVENTS_QUERY, {
      variables: {
        routeId,
        direction,
        departureDate: date,
      },
    })

    return get(response, 'data.vehicles', [])
  }

  async getJourneyEvents(
    routeId,
    direction,
    departureDate,
    departureTime,
    uniqueVehicleId = ''
  ): Promise<Vehicles[]> {
    // TODO: Check what this returns for 24h+ queries and make sure that only events from one journey is used.
    let operatorId
    let vehicleId

    if (uniqueVehicleId) {
      const [operatorPart, vehiclePart] = uniqueVehicleId.split('/')
      operatorId = parseInt(operatorPart, 10)
      vehicleId = parseInt(vehiclePart, 10)
    }

    const response = await this.query(JOURNEY_EVENTS_QUERY, {
      variables: {
        routeId,
        direction,
        departureDate,
        departureTime: getNormalTime(departureTime),
        compareVehicleId: uniqueVehicleId ? { _eq: `${operatorId}/${vehicleId}` } : undefined,
        compareEventTime: isNextDay(departureTime)
          ? {
              _gt: moment.tz(departureDate, TZ).toISOString(),
            }
          : undefined,
      },
    })

    let vehicles: Vehicles[] = get(response, 'data.vehicles', [])

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
