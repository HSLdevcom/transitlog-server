import { gql } from 'apollo-server'

export const Stop = gql`
  type StopRoute {
    id: ID!
    originStopId: String
    lineId: String
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
    modes: [String]!
    _matchScore: Float
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
    routes: [StopRoute]!
  }

  input StopFilterInput {
    search: String
  }
`
