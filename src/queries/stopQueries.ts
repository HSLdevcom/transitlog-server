import { gql } from 'apollo-server'

export const StopFieldsFragment = gql`
  fragment StopFieldsFragment on Stop {
    nodeId
    stopId
    lat
    lon
    shortId
    nameFi
    stopRadius
    modes {
      nodes
    }
  }
`

export const STOPS = gql`
  query JoreStops {
    allStops {
      nodes {
        ...StopFieldsFragment
      }
    }
  }
  ${StopFieldsFragment}
`

export const STOPS_BY_BBOX = gql`
  query JoreStopsByBBox($minLat: Float!, $minLng: Float!, $maxLat: Float!, $maxLng: Float!) {
    stopsByBbox(minLat: $minLat, minLon: $minLng, maxLat: $maxLat, maxLon: $maxLng) {
      nodes {
        ...StopFieldsFragment
      }
    }
  }
  ${StopFieldsFragment}
`

export const STOP_BY_ID = gql`
  query JoreStopById($stopId: String!) {
    stopByStopId(stopId: $stopId) {
      routeSegments: routeSegmentsByStopId {
        nodes {
          dateBegin
          dateEnd
          routeId
          direction
          stopIndex
          timingStopType
          route {
            nodes {
              originstopId
              routeId
              direction
            }
          }
        }
      }
      ...StopFieldsFragment
    }
  }
  ${StopFieldsFragment}
`
