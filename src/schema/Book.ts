import { gql } from 'apollo-server'

export const Book = gql`
  type Book {
    title: String
    author: String
  }
`
