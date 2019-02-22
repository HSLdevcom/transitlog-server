import { QueryResolvers } from '../types/generated/resolver-types'

const queryBooks = (root, args, { app }) => app.books

export const queryResolvers: QueryResolvers.Resolvers = {
  books: queryBooks,
}
