import { gql } from 'apollo-server'

export const Stop = gql`
  type StopRoute {
    id: ID!
    originStopId: String
    destinationStopId: String
    routeId: String!
    direction: Direction!
    isTimingStop: Boolean
    distanceFromPrevious: Int
    distanceFromStart: Int
    duration: Int
    stopIndex: Int
    destination: String
    origin: String
    name: String
    mode: String
  }

  type RouteStop implements Position {
    id: ID!
    stopId: String!
    shortId: String
    lat: Float!
    lng: Float!
    name: String
    radius: Float
    routes: [StopRoute!]!
    alerts: [Alert!]!
  }

  type Stop implements Position {
    id: ID!
    stopId: String!
    shortId: String
    lat: Float!
    lng: Float!
    name: String
    radius: Float
    modes: [String]!
    _matchScore: Float
    alerts: [Alert!]!
  }

  type Terminal implements Position {
    id: ID!
    name: String!
    lat: Float!
    lng: Float!
    stopIds: [String!]
    stops: [RouteStop!]!
    modes: [String!]
  }

  input StopFilterInput {
    search: String
  }
`
