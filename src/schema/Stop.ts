import { gql } from 'apollo-server'

export const Stop = gql`
  type StopRoute {
    id: ID!
    originStopId: String
    routeId: String!
    direction: Direction!
    isTimingStop: Boolean!
    destination: String
    origin: String
    name: String
    mode: String
  }

  type Stop implements Position {
    id: ID!
    stopId: String!
    shortId: String!
    lat: Float!
    lng: Float!
    name: String
    radius: Float
    routes: [StopRoute!]!
    modes: [String]!
    isTimingStop: Boolean!
    stopIndex: Int
    _matchScore: Float
    alerts: [Alert!]!
  }

  input StopFilterInput {
    search: String
  }
`
