import { queryResolvers } from './queryResolvers'
import { DateScalar } from './scalars/Date'
import { TimeScalar } from './scalars/Time'
import { DateTimeScalar } from './scalars/DateTime'
import { VehicleIdScalar } from './scalars/VehicleId'
import { BBoxScalar, PreciseBBoxScalar } from './scalars/BBox'
import { DirectionScalar } from './scalars/Direction'
import { StringIndexed } from '../types/StringIndexed'

export const resolvers: StringIndexed<any> = {
  Query: queryResolvers,
  Date: DateScalar,
  Time: TimeScalar,
  DateTime: DateTimeScalar,
  VehicleId: VehicleIdScalar,
  BBox: BBoxScalar,
  PreciseBBox: PreciseBBoxScalar,
  Direction: DirectionScalar,
  JourneyEventType: {
    __resolveType(obj) {
      if (obj.plannedDateTime && !obj.recordedAt) {
        return 'PlannedStopEvent'
      }

      if (typeof obj.isCancelled !== 'undefined') {
        return 'JourneyCancellationEvent'
      }

      if (obj.plannedDateTime && obj.recordedAt) {
        return 'JourneyStopEvent'
      }

      return 'JourneyEvent'
    },
  },
  Position: {
    __resolveType(obj) {
      if (obj.recordedAt) {
        return 'JourneyEvent'
      }

      if (obj.stopId && !obj.routeId && !obj.routes) {
        return 'SimpleStop'
      }

      if (obj.stopId && !obj.routeId) {
        return 'Stop'
      }

      if (obj.stopId && obj.routeId) {
        return 'RouteSegment'
      }

      if (Object.keys(obj).length === 2) {
        return 'RouteGeometryPoint'
      }

      return null
    },
  },
}
