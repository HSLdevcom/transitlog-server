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
    mode: String
    alerts: [Alert!]!
    cancellations: [Cancellation!]!
    _matchScore: Float
  }

  type RouteSegment implements Position {
    id: ID!
    lineId: String
    routeId: String!
    direction: Direction!
    originStopId: String
    destination: String!
    distanceFromPrevious: Int
    distanceFromStart: Int
    duration: Int
    stopIndex: Int!
    isTimingStop: Boolean!
    stopId: String!
    shortId: String!
    lat: Float!
    lng: Float!
    name: String
    radius: Float
    modes: [String]!
    alerts: [Alert!]!
  }

  type RouteGeometryPoint implements Position {
    lat: Float!
    lng: Float!
  }

  type RouteGeometry {
    id: ID!
    mode: String
    coordinates: [RouteGeometryPoint!]!
  }

  input RouteFilterInput {
    routeId: String
    direction: Direction
    search: String
  }
`
