import { GraphQLScalarType, Kind } from 'graphql'
import { StringOrNull } from '../../types/NullOr'
import { UserInputError } from 'apollo-server'
import { BBox } from '../../types/BBox'
import { createBBoxString } from '../../utils/createBBoxString'

function validateBbox(value: unknown): BBox | null {
  if (typeof value !== 'string' || !value) {
    return null
  }

  const coords = value.split(',')
  const [minLng, minLat, maxLng, maxLat] = coords.map((c) => {
    const num = parseFloat(c)

    if (!c || isNaN(num)) {
      return false
    }

    return num
  })

  // Validate the bbox parts
  if (!minLng || !maxLng || minLng > maxLng) {
    throw new UserInputError(
      'Validation failed: The BBox scalar type expects a string formatted like minLng,minLat,maxLng,maxLat. Lng props not found, or they were invalid.'
    )
  }

  if (!minLat || !maxLat || minLat > maxLat) {
    console.log(minLat, maxLat)
    throw new UserInputError(
      'Validation failed: The BBox scalar type expects a string formatted like minLng,minLat,maxLng,maxLat. Lat props not found, or they were invalid.'
    )
  }

  return {
    minLng,
    minLat,
    maxLng,
    maxLat,
  }
}

export const BBoxScalar = new GraphQLScalarType({
  name: 'BBox',
  description:
    "A string that defines a bounding box. The coordinates should be in the format `minLng,maxLat,maxLng,minLat` which is compatible with what Leaflet's LatLngBounds.toBBoxString() returns.",
  parseValue(value: StringOrNull): BBox | null {
    return validateBbox(value)
  },
  serialize(value): StringOrNull {
    if (typeof value !== 'string' || !value) {
      return null
    }

    return createBBoxString(validateBbox(value))
  },
  parseLiteral(ast): BBox | null {
    if (ast.kind === Kind.STRING) {
      return validateBbox(ast.value)
    }
    return null
  },
})
