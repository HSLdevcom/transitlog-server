import { gql } from 'apollo-server'

export const Schema = gql`
  schema {
    query: Query
  }

  type Query {
    books: [Book]
  }
`
