import { GraphQLScalarType, Kind } from 'graphql'
import { NumberOrNull } from '../../types/NullOr'
import { getDirection } from '../../utils/getDirection'

export const DirectionScalar = new GraphQLScalarType({
  name: 'Direction',
  description: 'The direction of a route. An integer of either 1 or 2.',
  parseValue(value): NumberOrNull {
    return getDirection(value)
  },
  serialize(value): NumberOrNull {
    return getDirection(value)
  },
  parseLiteral(ast): NumberOrNull {
    if (ast.kind === Kind.STRING || ast.kind === Kind.INT) {
      return getDirection(ast.value)
    }
    return null
  },
})
