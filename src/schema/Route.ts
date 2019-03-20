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
    originStopId: String!
    _matchScore: Float
  }

  type RouteSegment {
    id: ID!
    lineId: String!
    routeId: String!
    direction: Direction!
    originStopId: String!
    stopId: String!
    stop: Stop!
    destination: String!
    distanceFromPrevious: Int
    distanceFromStart: Int
    duration: Int
    stopIndex: Int!
    isTimingStop: Boolean!
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
`
