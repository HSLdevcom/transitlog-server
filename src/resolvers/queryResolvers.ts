import { QueryResolvers } from '../types/generated/schema'

const queryBooks = app => () => app.books

export const queryResolvers = (app): QueryResolvers.Resolvers => ({
  books: queryBooks(app),
})
