import { gql } from 'apollo-server'

export const Stop = gql`
  type StopRoute {
    id: ID!
    originStopId: String
    lineId: String
    routeId: String!
    direction: Direction!
    isTimingStop: Boolean!
    mode: String
  }

  type SimpleRoute {
    routeId: String!
    direction: Direction!
    isTimingStop: Boolean!
  }

  type SimpleStop implements Position {
    id: ID!
    stopId: String!
    shortId: String!
    lat: Float!
    lng: Float!
    name: String
    radius: Float
    routes: [SimpleRoute!]!
    modes: [String]!
    _matchScore: Float
    alerts: [Alert!]!
  }

  type Stop implements Position {
    id: ID!
    stopId: String!
    shortId: String!
    lat: Float!
    lng: Float!
    name: String
    radius: Float
    modes: [String]!
    routes: [StopRoute!]!
    alerts: [Alert!]!
  }

  input StopFilterInput {
    search: String
  }
`
