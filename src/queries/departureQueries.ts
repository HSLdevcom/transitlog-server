import { gql } from 'apollo-server'
import { StopFieldsFragment } from './stopQueries'

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
        stopId
        dayType
        hours
        minutes
        arrivalHours
        arrivalMinutes
        terminalTime
        recoveryTime
        equipmentRequired
        equipmentType
        trunkColorRequired
        operatorId
        dateBegin
        dateEnd
        routeId
        direction
        departureId
        extraDeparture
        isNextDay
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
`
