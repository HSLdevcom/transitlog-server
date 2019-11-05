import { gql } from 'apollo-server'

export const ExceptionDays = gql`
  type ExceptionDay {
    id: ID!
    exceptionDate: Date!
    effectiveDayTypes: [String!]!
    scopedDayType: String!
    dayType: String!
    modeScope: String!
    scope: String!
    description: String
    exclusive: Boolean!
    startTime: Time
    endTime: Time
  }
`
