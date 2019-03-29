import { gql } from 'apollo-server'

export const EXCEPTION_DAYS_QUERY = gql`
  query JoreExceptionDays {
    exceptionDayIndex: allExceptionDays {
      nodes {
        description
        exceptionDayType
      }
    }
    exceptionDays: allExceptionDaysCalendars {
      nodes {
        dateInEffect
        dayType
        exceptionDayType
        exclusive
      }
    }
    replacementDays: allReplacementDaysCalendars {
      nodes {
        dateInEffect
        dayType
        replacingDayType
        scope
        timeBegin
        timeEnd
      }
    }
  }
`
