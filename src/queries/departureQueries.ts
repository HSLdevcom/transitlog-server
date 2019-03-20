import { gql } from 'apollo-server'
import { StopFieldsFragment } from './stopQueries'

export const DepartureFieldsFragment = gql`
  fragment DepartureFieldsFragment on Departure {
    stopId
    extraDeparture
    routeId
    direction
    hours
    minutes
    isNextDay
    arrivalHours
    arrivalMinutes
    departureId
    dateBegin
    dateEnd
    dayType
    terminalTime
    recoveryTime
    equipmentRequired
    equipmentType
    trunkColorRequired
    operatorId
  }
`

export const DEPARTURE_STOP = gql`
  query stopByStopId($stopId: String!) {
    stop: stopByStopId(stopId: $stopId) {
      ...StopFieldsFragment
      routeSegments: routeSegmentsByStopId {
        nodes {
          dateBegin
          dateEnd
          destinationFi
          distanceFromPrevious
          distanceFromStart
          duration
          routeId
          direction
          stopIndex
          stopId
          nextStopId
          timingStopType
          route {
            nodes {
              dateBegin
              dateEnd
              routeId
              direction
              originstopId
              line {
                nodes {
                  lineId
                }
              }
            }
          }
        }
      }
    }
  }
  ${StopFieldsFragment}
`

export const DEPARTURES_FOR_STOP_QUERY = gql`
  query allDepartures($dayType: String!, $stopId: String!) {
    allDepartures(
      orderBy: [HOURS_ASC, MINUTES_ASC, DEPARTURE_ID_ASC]
      condition: { stopId: $stopId, dayType: $dayType }
    ) {
      nodes {
        ...DepartureFieldsFragment
        originDeparture {
          stopId
          dayType
          hours
          minutes
          routeId
          direction
          departureId
          arrivalHours
          arrivalMinutes
          isNextDay
        }
      }
    }
  }
  ${DepartureFieldsFragment}
`

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
