import { GraphQLScalarType, Kind } from 'graphql'
import { StringOrNull } from '../../types/NullOr'
import { UserInputError } from 'apollo-server'

const validateBbox = (value: unknown): StringOrNull => {
  if (typeof value !== 'string' || !value) {
    return null
  }

  const coords = value.split(',')
  const [minLng, maxLat, maxLng, minLat] = coords.map((c) => {
    const num = parseInt(c, 10)

    if (!c || isNaN(num)) {
      return false
    }

    return num
  })

  // Validate the bbox parts
  if (!minLng || !maxLng || minLng > maxLng) {
    throw new UserInputError(
      'Validation failed: The BBox scalar type expects a string formatted like minLng,maxLat,maxLng,minLat. Lng props not found, or they were invalid.'
    )
  }

  if (!minLat || !maxLat || minLat > maxLat) {
    throw new UserInputError(
      'Validation failed: The BBox scalar type expects a string formatted like minLng,maxLat,maxLng,minLat. Lat props not found, or they were invalid.'
    )
  }

  return `${minLng},${maxLat},${maxLng},${minLat}`
}

export const BBoxScalar = new GraphQLScalarType({
  name: 'BBox',
  description:
    "A string that defines a bounding box. The coordinates should be in the format `minLng,maxLat,maxLng,minLat` which is compatible with what Leaflet's LatLngBounds.toBBoxString() returns.",
  parseValue(value: StringOrNull) {
    return validateBbox(value)
  },
  serialize(value): StringOrNull {
    if (typeof value !== 'string' || !value) {
      return null
    }

    return value
  },
  parseLiteral(ast): StringOrNull {
    if (ast.kind === Kind.STRING) {
      return ast.value
    }
    return null
  },
})
