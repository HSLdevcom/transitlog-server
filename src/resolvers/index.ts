import { queryResolvers } from './queryResolvers'
import { StringIndexed } from '../types/StringIndexed'
import { IResolvers } from '../types/generated/resolver-types'
import { DateScalar } from './scalars/Date'
import { TimeScalar } from './scalars/Time'
import { DateTimeScalar } from './scalars/DateTime'
import { VehicleIdScalar } from './scalars/VehicleId'
import { BBoxScalar } from './scalars/BBox'

export const resolvers: StringIndexed<IResolvers> = {
  Query: queryResolvers,
  Date: DateScalar,
  Time: TimeScalar,
  DateTime: DateTimeScalar,
  VehicleId: VehicleIdScalar,
  BBox: BBoxScalar,
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
