import { getDirection } from '../../utils/getDirection'
import { createStopObject } from './createStopObject'
import { get } from 'lodash'
import { RouteSegment } from '../../types/generated/schema-types'
import {
  RouteSegment as JoreRouteSegment,
  Route as JoreRoute,
} from '../../types/generated/jore-types'

export function createSegmentId(segment) {
  return `${segment.routeId}_${segment.direction}_${segment.stopIndex}_${segment.dateBegin}_${
    segment.dateEnd
  }`
}

export const createRouteSegmentObject = (
  routeSegment: JoreRouteSegment,
  route: JoreRoute
): RouteSegment => {
  return {
    ...createStopObject(get(routeSegment, 'stop', {})),
    id: createSegmentId(routeSegment),
    lineId: get(route, 'line.nodes[0].lineId', ''),
    routeId: routeSegment.routeId,
    direction: getDirection(routeSegment.direction),
    originStopId: route.originstopId,
    destination: routeSegment.destinationFi || '',
    distanceFromPrevious: routeSegment.distanceFromPrevious,
    distanceFromStart: routeSegment.distanceFromStart,
    duration: routeSegment.duration,
    stopIndex: routeSegment.stopIndex,
    isTimingStop: !!routeSegment.timingStopType,
  }
}
