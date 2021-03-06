import { GraphQLScalarType, Kind } from 'graphql'
import { StringOrNull } from '../../types/NullOr'
import { UserInputError } from 'apollo-server'
import { createUniqueVehicleId } from '../../utils/createUniqueVehicleId'

const parseAndFormat = (value: unknown): StringOrNull => {
  if (typeof value !== 'string' || !value) {
    return null
  }

  const [operatorPart, vehiclePart] = value.split('/')

  if (!operatorPart || !vehiclePart) {
    throw new UserInputError(
      'The VehicleId scalar type expects a string formatted like [operatorId]/[vehicleId].'
    )
  }

  return createUniqueVehicleId(operatorPart, vehiclePart)
}

export const VehicleIdScalar = new GraphQLScalarType({
  name: 'VehicleId',
  description:
    'A string that uniquely identifies a vehicle. The format is [operator ID]/[vehicle ID]. The operator ID is padded to have a length of 4 characters.',
  parseValue(value: unknown): StringOrNull {
    return parseAndFormat(value)
  },
  serialize(value: unknown): StringOrNull {
    return parseAndFormat(value)
  },
  parseLiteral(ast): StringOrNull {
    if (ast.kind === Kind.STRING) {
      return parseAndFormat(ast.value)
    }
    return null
  },
})
