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
    _matchScore: Float
    alerts: [Alert!]!
  }

  input StopFilterInput {
    search: String
  }
`
