import { getDirection } from '../../utils/getDirection'
import { createStopObject } from './createStopObject'
import { get } from 'lodash'
import { Alert, Cancellation, RouteSegment } from '../../types/generated/schema-types'
import { JoreRoute, JoreRouteData, Mode } from '../../types/Jore'

export function createSegmentId(routeSegment) {
  return `${routeSegment.route_id}_${routeSegment.direction}_${routeSegment.stop_index}_${
    routeSegment.date_begin
  }_${routeSegment.date_end}`
}

export const createRouteSegmentObject = (
  routeSegment: JoreRouteData,
  route?: JoreRoute | null,
  alerts: Alert[] = [],
  cancellations: Cancellation[] = []
): RouteSegment => {
  return {
    ...createStopObject({ ...routeSegment, modes: routeSegment.mode || Mode.Bus }),
    id: createSegmentId({ ...route, ...routeSegment }),
    lineId: get(routeSegment, 'line_id', get(route, 'line_id', '')),
    routeId: routeSegment.route_id,
    direction: getDirection(routeSegment.direction),
    originStopId: get(routeSegment, 'originstop_id', get(route, 'originstop_id', '')),
    destination: get(routeSegment, 'destination_fi', get(route, 'destination_fi', '')) || '',
    distanceFromPrevious: routeSegment.distance_from_previous,
    distanceFromStart: routeSegment.distance_from_start,
    duration: routeSegment.duration,
    stopIndex: routeSegment.stop_index,
    isTimingStop: !!routeSegment.timing_stop_type,
    alerts,
    cancellations,
  }
}
