import { getDirection } from '../utils/getDirection'
import { createStopObject } from './createStopObject'
import { get } from 'lodash'
import { Alert, Cancellation, RouteSegment } from '../types/generated/schema-types'
import { JoreRouteSegment } from '../types/Jore'
import { validModes } from '../utils/validModes'

export function createSegmentId(routeSegment) {
  return `${routeSegment.route_id}_${routeSegment.direction}_${routeSegment.stop_index}_${routeSegment.date_begin}_${routeSegment.date_end}`
}

export const createRouteSegmentObject = (
  routeSegment: JoreRouteSegment,
  alerts: Alert[] = [],
  cancellations: Cancellation[] = []
): RouteSegment => {
  const modes = validModes(routeSegment?.mode)

  return {
    ...createStopObject({ ...routeSegment, modes }),
    id: createSegmentId(routeSegment),
    routeId: routeSegment.route_id,
    direction: getDirection(routeSegment.direction),
    originStopId: get(routeSegment, 'originstop_id', '') || '',
    destination: get(routeSegment, 'destination_fi', '') || '',
    distanceFromPrevious: routeSegment.distance_from_previous,
    distanceFromStart: routeSegment.distance_from_start,
    duration: routeSegment.duration,
    stopIndex: routeSegment.stop_index,
    isTimingStop: !!routeSegment.timing_stop_type,
    modes,
    alerts,
    cancellations,
  } as RouteSegment
}
