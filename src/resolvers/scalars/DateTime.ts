import { GraphQLScalarType, Kind } from 'graphql'

// TODO: Add validation for DateTime

export const DateTimeScalar = new GraphQLScalarType({
  name: 'Date',
  description: 'A DateTime string in ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ). Timezone will be converted to the zerver timezone.',
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
