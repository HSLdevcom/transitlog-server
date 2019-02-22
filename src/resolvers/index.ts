import { queryResolvers } from './queryResolvers'
import { StringIndexed } from '../types/StringIndexed'
import { IResolvers } from '../types/generated/resolver-types'

export const resolvers: StringIndexed<IResolvers> = {
  Query: queryResolvers,
}
