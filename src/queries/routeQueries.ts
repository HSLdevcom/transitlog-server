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
