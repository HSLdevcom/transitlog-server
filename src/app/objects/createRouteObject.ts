import { Route } from '../../types/generated/schema-types'
import { Route as JoreRoute } from '../../types/generated/jore-types'
import { get } from 'lodash'

function createRouteId(route: JoreRoute): string {
  return `${route.routeId}_${route.direction}_${route.dateBegin}_${route.dateEnd}`
}

export function createRouteObject(route: JoreRoute): Route {
  return {
    id: createRouteId(route),
    lineId: get(route, 'line.nodes[0].lineId', ''),
    routeId: route.routeId,
    direction: parseInt(route.direction, 10),
    origin: route.originFi,
    destination: route.destinationFi,
    name: route.nameFi,
    destinationStopId: route.destinationstopId,
    originStopId: route.originstopId,
    // @ts-ignore
    _matchScore: route._matchScore,
  }
}
