import { gql } from 'apollo-server'

export const Line = gql`
  type Line {
    id: ID!
    lineId: String!
    name: String
    routesCount: Int
    _matchScore: Float
  }

  input LineFilterInput {
    search: String
    includeLinesWithoutRoutes: Boolean
  }
`
