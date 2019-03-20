import { GraphQLScalarType, Kind } from 'graphql'
import { StringOrNull } from '../../types/NullOr'
import { UserInputError } from 'apollo-server'
import { BBox } from '../../types/BBox'
import { createBBoxString } from '../../utils/createBBoxString'
import { getRoundedBbox } from '../../utils/getRoundedBbox'

function createBboxObject(value: unknown, round = true): BBox | null {
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

  const bboxObj = {
    minLng,
    minLat,
    maxLng,
    maxLat,
  }

  if (!round) {
    return bboxObj
  }

  return getRoundedBbox(bboxObj)
}

export const BBoxScalar = new GraphQLScalarType({
  name: 'BBox',
  description:
    "A string that defines a bounding box. The coordinates should be in the format `minLng,maxLat,maxLng,minLat` which is compatible with what Leaflet's LatLngBounds.toBBoxString() returns. Toe coordinates will be rounded, use PreciseBBox if this is not desired.",
  parseValue(value: StringOrNull): BBox | null {
    return createBboxObject(value, true)
  },
  serialize(value): StringOrNull {
    if (typeof value !== 'string' || !value) {
      return null
    }

    return createBBoxString(createBboxObject(value, true))
  },
  parseLiteral(ast): StringOrNull {
    if (ast.kind === Kind.STRING) {
      return createBBoxString(createBboxObject(ast.value, true))
    }
    return null
  },
})

export const PreciseBBoxScalar = new GraphQLScalarType({
  name: 'PreciseBBox',
  description:
    "A string that defines a bounding box. The coordinates should be in the format `minLng,maxLat,maxLng,minLat` which is compatible with what Leaflet's LatLngBounds.toBBoxString() returns. The precise bbox is not rounded.",
  parseValue(value: StringOrNull): BBox | null {
    return createBboxObject(value, false)
  },
  serialize(value): StringOrNull {
    if (typeof value !== 'string' || !value) {
      return null
    }

    return createBBoxString(createBboxObject(value, false))
  },
  parseLiteral(ast): StringOrNull {
    if (ast.kind === Kind.STRING) {
      return createBBoxString(createBboxObject(ast.value, false))
    }
    return null
  },
})
