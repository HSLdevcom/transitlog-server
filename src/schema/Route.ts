import { gql } from 'apollo-server'

export const Route = gql`
  type Route {
    id: ID!
    lineId: String!
    routeId: String!
    direction: Direction!
    destination: String
    origin: String
    name: String
    destinationStopId: String
    originStopId: String
    _matchScore: Float
  }

  type Line {
    id: ID!
    lineId: String!
    name: String
    _matchScore: Float
  }

  type RouteGeometryPoint implements Position {
    lat: Float!
    lng: Float!
  }

  type RouteGeometry {
    coordinates: [RouteGeometryPoint!]!
  }

  input RouteFilterInput {
    routeId: String
    direction: Direction
    search: String
  }

  input LineFilterInput {
    lineId: String
    includeLinesWithoutRoutes: Boolean
  }
`
