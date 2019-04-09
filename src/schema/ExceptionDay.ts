import { gql } from 'apollo-server'

export const ExceptionDays = gql`
  type ExceptionDay {
    id: ID!
    exceptionDate: Date!
    effectiveDayTypes: [String!]!
    dayType: String!
    modeScope: String
    description: String
    exclusive: Boolean!
    startTime: Time
    endTime: Time
  }
`
