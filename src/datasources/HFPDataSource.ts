import { GraphQLDataSource } from '../utils/GraphQLDataSource'
import { get } from 'lodash'
import moment from 'moment-timezone'
import { HFP_URL, TZ } from '../constants'
import { Vehicles } from '../types/generated/hfp-types'
import { AVAILABLE_VEHICLES_QUERY } from '../queries/vehicleQueries'
import {
  AREA_EVENTS_QUERY,
  JOURNEY_EVENTS_QUERY,
  ROUTE_JOURNEY_EVENTS_QUERY,
  VEHICLE_JOURNEYS_QUERY,
} from '../queries/journeyQueries'
import { DEPARTURE_EVENTS_QUERY } from '../queries/departureQueries'
import { getNormalTime, isNextDay } from '../utils/time'

export class HFPDataSource extends GraphQLDataSource {
  baseURL = HFP_URL

  async getAvailableVehicles(date): Promise<Vehicles[]> {
    const response = await this.query(AVAILABLE_VEHICLES_QUERY, {
      variables: { date },
    })
    return get(response, 'data.vehicles', [])
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
}
