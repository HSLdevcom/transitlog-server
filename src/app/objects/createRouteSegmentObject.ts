import { getDirection } from '../../utils/getDirection'
import { createStopObject } from './createStopObject'
import { get } from 'lodash'
import { RouteSegment } from '../../types/generated/schema-types'
import { JoreRouteSegment, JoreRoute } from '../../types/Jore'

export function createSegmentId(routeSegment) {
  return `${routeSegment.route_id}_${routeSegment.direction}_${routeSegment.stop_index}_${
    routeSegment.date_begin
  }_${routeSegment.date_end}`
}

export const createRouteSegmentObject = (
  routeSegment: JoreRouteSegment,
  route: JoreRoute
): RouteSegment => {
  return {
    ...createStopObject(get(routeSegment, 'stop', {})),
    id: createSegmentId(routeSegment),
    lineId: get(route, 'line.nodes[0].line_id', ''),
    routeId: routeSegment.route_id,
    direction: getDirection(routeSegment.direction),
    originStopId: route.originstop_id,
    destination: routeSegment.destination_fi || '',
    distanceFromPrevious: routeSegment.distance_from_previous,
    distanceFromStart: routeSegment.distance_from_start,
    duration: routeSegment.duration,
    stopIndex: routeSegment.stop_index,
    isTimingStop: !!routeSegment.timing_stop_type,
  }
}
