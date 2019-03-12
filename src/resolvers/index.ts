import { queryResolvers } from './queryResolvers'
import { DateScalar } from './scalars/Date'
import { TimeScalar } from './scalars/Time'
import { DateTimeScalar } from './scalars/DateTime'
import { VehicleIdScalar } from './scalars/VehicleId'
import { BBoxScalar } from './scalars/BBox'
import { DirectionScalar } from './scalars/Direction'
import { StringIndexed } from '../types/StringIndexed'

export const resolvers: StringIndexed<any> = {
  Query: queryResolvers,
  Date: DateScalar,
  Time: TimeScalar,
  DateTime: DateTimeScalar,
  VehicleId: VehicleIdScalar,
  BBox: BBoxScalar,
  Direction: DirectionScalar,
  Position: {
    __resolveType(obj, context, info) {
      if (obj.recordedAt) {
        return 'JourneyEvent'
      }

      if (obj.stopId) {
        return 'Stop'
      }

      if (Object.keys(obj).length === 2) {
        return 'RouteGeometryPoint'
      }

      return null
    },
  },
}
