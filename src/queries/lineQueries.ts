import { gql } from 'apollo-server'

export const LineFieldsFragment = gql`
  fragment LineFieldsFragment on Line {
    lineId
    nameFi
    dateBegin
    dateEnd
    routes {
      totalCount
    }
  }
`

export const LINES = gql`
  query JoreLines {
    allLines {
      nodes {
        ...LineFieldsFragment
      }
    }
  }
  ${LineFieldsFragment}
`
