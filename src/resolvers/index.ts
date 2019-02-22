import { queryResolvers } from './queryResolvers'
import { StringIndexed } from '../types/StringIndexed'
import { IResolvers } from '../types/generated/schema'

export const resolvers = (app): StringIndexed<IResolvers> => ({
  Query: queryResolvers(app),
})
