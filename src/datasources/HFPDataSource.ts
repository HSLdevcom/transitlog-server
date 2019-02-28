import { GraphQLDataSource } from '../utils/GraphQLDataSource'
import { get } from 'lodash'
import { HFP_URL } from '../constants'
import { Vehicles } from '../types/generated/hfp-types'
import { AVAILABLE_VEHICLES_QUERY } from '../queries/vehicleQueries'

export class HFPDataSource extends GraphQLDataSource {
  baseURL = HFP_URL

  async getAvailableVehicles(date): Promise<Vehicles[]> {
    const response = await this.query(AVAILABLE_VEHICLES_QUERY, {
      variables: { date },
    })
    return get(response, 'data.vehicles', [])
  }
}
