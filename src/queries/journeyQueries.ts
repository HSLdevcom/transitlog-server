import { gql } from 'apollo-server'

// These queries are for the HFP datasource.

const JourneyFieldsFragment = gql`
  fragment JourneyFieldsFragment on vehicles {
    journey_start_time
    next_stop_id
    tst
    tsi
    owner_operator_id
    vehicle_number
    unique_vehicle_id
    mode
    oday
    direction_id
    route_id
    desi
    headsign
  }
`

const JourneyEventFieldsFragment = gql`
  fragment JourneyEventFieldsFragment on vehicles {
    next_stop_id
    lat
    long
    drst
    spd
    dl
    hdg
  }
`

export const JOURNEY_EVENTS_QUERY = gql`
  query JourneyEventsQuery(
    $departureDate: date!
    $routeId: String!
    $departureTime: time!
    $direction: smallint!
    $compareVehicleId: text_comparison_exp
    $compareEventTime: timestamptz_comparison_exp
  ) {
    vehicles(
      order_by: { tst: asc }
      where: {
        oday: { _eq: $departureDate }
        route_id: { _eq: $routeId }
        direction_id: { _eq: $direction }
        journey_start_time: { _eq: $departureTime }
        unique_vehicle_id: $compareVehicleId
        tst: $compareEventTime
      }
    ) {
      ...JourneyFieldsFragment
      ...JourneyEventFieldsFragment
    }
  }
  ${JourneyFieldsFragment}
  ${JourneyEventFieldsFragment}
`

export const ROUTE_JOURNEY_LIST_QUERY = gql`
  query RouteJourneyListQuery($departureDate: date!, $routeId: String!, $direction: smallint!) {
    vehicles(
      distinct_on: [journey_start_time]
      order_by: [{ journey_start_time: asc }, { tst: asc }]
      where: {
        oday: { _eq: $departureDate }
        route_id: { _eq: $routeId }
        direction_id: { _eq: $direction }
      }
    ) {
      tst
      tsi
      journey_start_time
      next_stop_id
      route_id
      direction_id
      oday
      unique_vehicle_id
    }
  }
`

export const ROUTE_JOURNEY_EVENTS_QUERY = gql`
  query RouteJourneyEventsQuery($departureDate: date!, $routeId: String!, $direction: smallint!) {
    vehicles(
      order_by: { tst: asc }
      where: {
        oday: { _eq: $departureDate }
        route_id: { _eq: $routeId }
        direction_id: { _eq: $direction }
        geohash_level: { _lte: 3 }
      }
    ) {
      ...JourneyFieldsFragment
      ...JourneyEventFieldsFragment
    }
  }
  ${JourneyFieldsFragment}
  ${JourneyEventFieldsFragment}
`

export const VEHICLE_JOURNEYS_QUERY = gql`
  query vehicleHfpQuery($date: date!, $uniqueVehicleId: String!) {
    vehicles(
      order_by: [{ tst: asc }]
      where: { oday: { _eq: $date }, unique_vehicle_id: { _eq: $uniqueVehicleId } }
    ) {
      ...JourneyFieldsFragment
    }
  }
  ${JourneyFieldsFragment}
`

export const AREA_EVENTS_QUERY = gql`
  query areaEventsQuery(
    $date: date!
    $minTime: timestamptz!
    $maxTime: timestamptz!
    $minLat: float8!
    $maxLat: float8!
    $minLng: float8!
    $maxLng: float8!
  ) {
    vehicles(
      order_by: { tsi: asc }
      where: {
        _and: [
          { geohash_level: { _lte: 4 } }
          { oday: { _eq: $date } }
          { tst: { _lte: $maxTime } }
          { tst: { _gte: $minTime } }
          { lat: { _lte: $maxLat } }
          { lat: { _gte: $minLat } }
          { long: { _lte: $maxLng } }
          { long: { _gte: $minLng } }
        ]
      }
    ) {
      ...JourneyFieldsFragment
      ...JourneyEventFieldsFragment
    }
  }
  ${JourneyFieldsFragment}
  ${JourneyEventFieldsFragment}
`
