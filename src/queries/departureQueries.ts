import { gql } from 'apollo-server'

export const DEPARTURE_EVENTS_QUERY = gql`
  query departureEvents($date: date!, $stopId: String!) {
    vehicles(
      distinct_on: [journey_start_time, unique_vehicle_id]
      order_by: [{ journey_start_time: asc }, { unique_vehicle_id: asc }, { tst: desc }]
      where: { next_stop_id: { _eq: $stopId }, oday: { _eq: $date } }
    ) {
      journey_start_time
      next_stop_id
      oday
      direction_id
      route_id
      unique_vehicle_id
      tst
      tsi
      lat
      long
      __typename
    }
  }
`

export const ROUTE_DEPARTURES_EVENTS_QUERY = gql`
  query routeDepartureEvents(
    $date: date!
    $stopId: String!
    $routeId: String!
    $direction: smallint!
  ) {
    vehicles(
      distinct_on: [journey_start_time, unique_vehicle_id]
      order_by: [{ journey_start_time: asc }, { unique_vehicle_id: asc }, { tst: desc }]
      where: {
        next_stop_id: { _eq: $stopId }
        oday: { _eq: $date }
        route_id: { _eq: $routeId }
        direction_id: { _eq: $direction }
      }
    ) {
      journey_start_time
      next_stop_id
      oday
      direction_id
      route_id
      unique_vehicle_id
      tst
      tsi
      lat
      long
      __typename
    }
  }
`

export const ROUTE_WEEK_DEPARTURES_EVENTS_QUERY = gql`
  query routeWeekDepartureEvents(
    $minDate: date!
    $maxDate: date!
    $stopId: String!
    $routeId: String!
    $direction: smallint!
  ) {
    vehicles(
      distinct_on: [oday, journey_start_time, unique_vehicle_id]
      order_by: [
        { oday: asc }
        { journey_start_time: asc }
        { unique_vehicle_id: asc }
        { tst: desc }
      ]
      where: {
        _and: [
          { next_stop_id: { _eq: $stopId } }
          { oday: { _gte: $minDate, _lte: $maxDate } }
          { route_id: { _eq: $routeId } }
          { direction_id: { _eq: $direction } }
        ]
      }
    ) {
      journey_start_time
      next_stop_id
      oday
      direction_id
      route_id
      unique_vehicle_id
      tst
      tsi
      lat
      long
      __typename
    }
  }
`
