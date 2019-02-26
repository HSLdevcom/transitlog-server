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
  query JoreStopsByBBox(
    $minLat: Float!
    $minLon: Float!
    $maxLat: Float!
    $maxLon: Float!
  ) {
    stopsByBbox(minLat: $minLat, minLon: $minLon, maxLat: $maxLat, maxLon: $maxLon) {
      nodes {
        ...StopFieldsFragment
      }
    }
  }
  ${StopFieldsFragment}
`
