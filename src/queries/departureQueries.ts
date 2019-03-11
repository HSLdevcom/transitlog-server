import { gql } from 'apollo-server'
import { StopFieldsFragment } from './stopQueries'

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
        stop: stopByStopId {
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
  ${StopFieldsFragment}
`
