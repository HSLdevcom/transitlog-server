import { GraphQLScalarType, Kind } from 'graphql'

// TODO: Add validation for Date

export const DateScalar = new GraphQLScalarType({
  name: 'Date',
  description: 'A Date string in YYYY-MM-DD format.',
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
