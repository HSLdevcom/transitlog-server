import { getDirection } from '../utils/getDirection'
import { createStopObject } from './createStopObject'
import { Alert, Cancellation, RouteSegment } from '../types/generated/schema-types'
import { JoreRouteStop } from '../types/Jore'
import { validModes } from '../utils/validModes'

export function createSegmentId(routeSegment) {
  return `${routeSegment.route_id}_${routeSegment.direction}_${routeSegment.stop_index}_${routeSegment.date_begin}_${routeSegment.date_end}`
}

/*
 * The RouteSegment is only used in Journey responses and created with a StopRoute fetched from JORE.
 * It is a combination of a route and a stop.
 */

export const createRouteSegmentObject = (
  routeSegment: JoreRouteStop,
  alerts: Alert[] = [],
  cancellations: Cancellation[] = [],
  duration: number = 0
): RouteSegment => {
  const modes = validModes(...(routeSegment?.modes || []), routeSegment?.mode)

  return {
    ...createStopObject({ ...routeSegment, modes }),
    id: createSegmentId(routeSegment),
    originStopId: routeSegment.originstop_id,
    destinationStopId: routeSegment.destinationstop_id,
    origin: routeSegment.origin_fi,
    destination: routeSegment.destination_fi,
    routeId: routeSegment.route_id,
    direction: getDirection(routeSegment.direction),
    distanceFromPrevious: routeSegment.distance_from_previous,
    distanceFromStart: routeSegment.distance_from_start,
    duration,
    stopIndex: routeSegment.stop_index,
    isTimingStop: !!routeSegment.timing_stop_type,
    mode: routeSegment.mode,
    alerts,
    cancellations,
  } as RouteSegment
}
