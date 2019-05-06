import { gql } from 'apollo-server'

export const Alerts = gql`
  enum AlertDistribution {
    NETWORK
    ROUTE
    DEPARTURE
    STOP
  }

  enum AlertLevel {
    NOTICE
    DISRUPTION
    CRISIS
  }

  type Alert {
    id: ID!
    alertLevel: AlertLevel!
    distribution: AlertDistribution!
    affectedId: String!
    startDateTime: DateTime!
    endDateTime: DateTime!
    title: String!
    description: String!
    url: String
  }

  type Cancellation {
    id: ID!
    routeId: String!
    direction: Direction!
    departureDate: Date!
    journeyStartTime: Time!
    reason: String
    isCancelled: Boolean
  }
`
