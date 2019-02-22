import { GraphQLScalarType, Kind } from 'graphql'

// TODO: Add validation for VehicleId

export const VehicleIdScalar = new GraphQLScalarType({
  name: 'VehicleId',
  description: 'A string that uniquely identifies a vehicle. The format is [operator ID]/[vehicle ID]. The operator ID is padded to have a length of 4 characters.',
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
