import { gql } from 'apollo-server'

// These queries are for the HFP datasource.

export const AVAILABLE_VEHICLES_QUERY = gql`
  query availableVehicleOptionsQuery($date: date) {
    vehicles(
      distinct_on: [unique_vehicle_id]
      order_by: [{ unique_vehicle_id: asc }]
      where: { oday: { _eq: $date }, geohash_level: { _eq: 0 } }
    ) {
      unique_vehicle_id
      vehicle_number
      owner_operator_id
    }
  }
`
