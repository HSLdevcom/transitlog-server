import { gql } from 'apollo-server'

export const Route = gql`
  type Route {
    id: ID!
    routeId: String!
    direction: Direction!
    destination: String
    origin: String
    name: String
    destinationStopId: String
    originStopId: String!
    routeLength: Int
    routeDurationMinutes: Int
    mode: String
    alerts: [Alert!]!
    cancellations: [Cancellation!]!
    _matchScore: Float
  }

  type RouteSegment implements Position {
    id: ID!
    routeId: String!
    direction: Direction!
    originStopId: String
    destinationStopId: String
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
    modes: [String!]
    alerts: [Alert!]!
    cancellations: [Cancellation!]!
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
