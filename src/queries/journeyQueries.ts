import { gql } from 'apollo-server'

// These queries are for the HFP datasource.

export const JOURNEY_EVENTS_QUERY = gql`
  query JourneyEventsQuery(
    $departureDate: date!
    $routeId: String!
    $departureTime: time!
    $direction: smallint!
    $uniqueVehicleId: String!
    $compareEventTime: timestamptz_comparison_exp
  ) {
    vehicles(
      order_by: { tst: asc }
      where: {
        oday: { _eq: $departureDate }
        route_id: { _eq: $routeId }
        direction_id: { _eq: $direction }
        journey_start_time: { _eq: $departureTime }
        unique_vehicle_id: { _eq: $uniqueVehicleId }
        tst: $compareEventTime
      }
    ) {
      journey_start_time
      next_stop_id
      tst
      tsi
      owner_operator_id
      vehicle_number
      lat
      long
      unique_vehicle_id
      drst
      spd
      mode
      dl
      hdg
      oday
      direction_id
      route_id
      desi
      headsign
    }
  }
`
