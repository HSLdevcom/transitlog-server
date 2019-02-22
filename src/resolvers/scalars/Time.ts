import { GraphQLScalarType, Kind } from 'graphql'

// TODO: Add validation for Time

export const TimeScalar = new GraphQLScalarType({
  name: 'Time',
  description: 'Time is seconds from 00:00:00 in format HH:mm:ss. The hours value can be more than 23.',
  parseValue(value) {
    return value
  },
  serialize(value) {
    return value
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return ast.value
    }
    return null
  },
})
