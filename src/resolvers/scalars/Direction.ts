import { GraphQLScalarType, Kind } from 'graphql'
import { NumberOrNull } from '../../types/NullOr'
import { getDirection } from '../../utils/getDirection'

const parseDirection = (value: unknown): string | number | false | null | undefined => {
  if (
    typeof value !== 'string' &&
    typeof value !== 'number' &&
    value !== false &&
    value !== null &&
    value !== undefined
  ) {
    throw new TypeError(`Direction cannot represent value: ${String(value)}`)
  }

  return getDirection(value)
}

export default new GraphQLScalarType({
  name: 'Direction',

  serialize(value: unknown) {
    return parseDirection(value)
  },

  parseValue(value: unknown) {
    return parseDirection(value)
  },

  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return getDirection(ast.value)
    }

    if (ast.kind === Kind.INT) {
      return getDirection(Number(ast.value))
    }

    if (ast.kind === Kind.BOOLEAN && ast.value === false) {
      return getDirection(false)
    }

    return null
  },
})
