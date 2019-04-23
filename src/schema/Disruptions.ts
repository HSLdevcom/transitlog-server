import { gql } from 'apollo-server'

export const Disruptions = gql`
  type Disruption {
    id: ID!
    affectedType: String!
    affectedId: String!
    direction: Direction
    startDateTime: DateTime!
    endDateTime: DateTime!
    title: String!
    description: String!
  }

  type Cancellation {
    id: ID!
    routeId: String!
    direction: Direction!
    departureDate: Date!
    journeyStartTime: Time!
    reason: String
  }
`
