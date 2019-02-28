import { gql } from 'apollo-server'
import { StopFieldsFragment } from './stopQueries'

export const RouteFieldsFragment = gql`
  fragment RouteFieldsFragment on Route {
    routeId
    nameFi
    dateBegin
    dateEnd
    direction
    destinationFi
    originFi
    destinationstopId
    originstopId
    line {
      nodes {
        lineId
      }
    }
  }
`

export const ExtensiveRouteFieldsFragment = gql`
  fragment ExtensiveRouteFieldsFragment on Route {
    type
    routeLength
    mode
    routeSegments {
      nodes {
        stopId
        nextStopId
        dateBegin
        dateEnd
        duration
        stopIndex
        distanceFromPrevious
        distanceFromStart
        destinationFi
        timingStopType
        direction
        routeId
        stop: stopByStopId {
          ...StopFieldsFragment
          departures: departuresByStopId(
            condition: { routeId: $routeId, direction: $direction, dayType: $dayType }
          ) {
            nodes {
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
          }
        }
      }
    }
  }
  ${StopFieldsFragment}
`

export const ROUTES = gql`
  query JoreRoutes {
    allRoutes {
      nodes {
        ...RouteFieldsFragment
      }
    }
  }
  ${RouteFieldsFragment}
`

export const ROUTE_GEOMETRY = gql`
  query JoreRouteGeometry($routeId: String!, $direction: String!) {
    allRoutes(condition: { routeId: $routeId, direction: $direction }) {
      nodes {
        dateBegin
        dateEnd
        geometries {
          nodes {
            dateBegin
            dateEnd
            geometry
          }
        }
      }
    }
  }
`

export const JOURNEY_ROUTE = gql`
  query JoreJourneyRoute($routeId: String!, $direction: String!, $dayType: String!) {
    allRoutes(condition: { routeId: $routeId, direction: $direction }) {
      nodes {
        ...RouteFieldsFragment
        ...ExtensiveRouteFieldsFragment
      }
    }
  }
  ${RouteFieldsFragment}
  ${ExtensiveRouteFieldsFragment}
`
