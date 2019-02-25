import { GraphQLScalarType, Kind } from 'graphql'
import { StringOrNull } from '../../types/NullOr'

const validateTime = (value: unknown): StringOrNull => {
  if (typeof value !== 'string' || !value) {
    return null
  }

  return value
}

export const TimeScalar = new GraphQLScalarType({
  name: 'Time',
  description:
    'Time is seconds from 00:00:00 in format HH:mm:ss. The hours value can be more than 23.',
  parseValue(value): StringOrNull {
    return validateTime(value)
  },
  serialize(value): StringOrNull {
    return validateTime(value)
  },
  parseLiteral(ast): StringOrNull {
    if (ast.kind === Kind.STRING) {
      return validateTime(ast.value)
    }
    return null
  },
})
