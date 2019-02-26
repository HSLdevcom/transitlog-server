import { gql } from 'apollo-server'

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
