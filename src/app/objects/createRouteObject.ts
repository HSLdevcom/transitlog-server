import { Route } from '../../types/generated/schema-types'
import { JoreRoute } from '../../types/Jore'
import { get } from 'lodash'

function createRouteId(route: JoreRoute): string {
  return `${route.route_id}_${route.direction}_${route.date_begin}_${route.date_end}`
}

export function createRouteObject(route: JoreRoute): Route {
  return {
    id: createRouteId(route),
    lineId: get(route, 'line_id', ''),
    routeId: route.route_id,
    direction: parseInt(route.direction, 10),
    origin: route.origin_fi,
    destination: route.destination_fi,
    name: get(route, 'route_name', get(route, 'name_fi', '')) || '',
    destinationStopId: route.destinationstop_id,
    originStopId: route.originstop_id,
    mode: route.mode,
    // @ts-ignore
    _matchScore: route._matchScore,
  }
}
