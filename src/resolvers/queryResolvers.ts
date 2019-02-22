import { QueryResolvers } from '../types/generated/resolver-types'

const queryBooks = app => () => app.books

export const queryResolvers = (app): QueryResolvers.Resolvers => ({
  books: queryBooks(app),
})
