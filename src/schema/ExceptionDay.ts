import { gql } from 'apollo-server'

export const ExceptionDays = gql`
  type ExceptionDay {
    id: ID!
    exceptionDate: Date!
    newDayType: String!
    dayType: String!
    modeScope: String
    description: String
    exclusive: Boolean!
    startTime: Time
    endTime: Time
  }
`
