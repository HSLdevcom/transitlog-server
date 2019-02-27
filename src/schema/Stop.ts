import { gql } from 'apollo-server'

export const Stop = gql`
  type Stop implements Position {
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

  input StopFilterInput {
    search: String
    bbox: BBox
  }
`
