import { GraphQLDataSource } from '../utils/GraphQLDataSource'
import { get } from 'lodash'
import { HFP_URL } from '../constants'
import { Vehicles } from '../types/generated/hfp-types'
import { AVAILABLE_VEHICLES_QUERY } from '../queries/vehicleQueries'
import { JOURNEY_EVENTS_QUERY } from '../queries/journeyQueries'

export class HFPDataSource extends GraphQLDataSource {
  baseURL = HFP_URL

  async getAvailableVehicles(date): Promise<Vehicles[]> {
    const response = await this.query(AVAILABLE_VEHICLES_QUERY, {
      variables: { date },
    })
    return get(response, 'data.vehicles', [])
  }

  async getJourneyEvents(
    routeId,
    direction,
    departureDate,
    departureTime
  ): Promise<Vehicles> {
    const response = await this.query(JOURNEY_EVENTS_QUERY, {
      variables: {
        routeId,
        direction,
        departureDate,
        departureTime,
      },
    })
    return get(response, 'data.vehicles', [])
  }
}
