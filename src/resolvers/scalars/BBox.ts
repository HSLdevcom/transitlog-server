import { GraphQLScalarType, Kind } from 'graphql'

// TODO: Add validation for Bbox

export const BBoxScalar = new GraphQLScalarType({
  name: 'BBox',
  description: 'A string that defines a bounding box. The coordinates should be in the format `minLng,maxLat,maxLng,minLat` which is compatible with what Leaflet\'s LatLngBounds.toBBoxString() returns.',
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
