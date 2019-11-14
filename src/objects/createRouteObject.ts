import { Alert, Cancellation, Route } from '../types/generated/schema-types'
import { JoreRoute } from '../types/Jore'
import { get } from 'lodash'
import { getDirection } from '../utils/getDirection'

function createRouteId(route: JoreRoute): string {
  return `${route.route_id}_${route.direction}_${route.date_begin}_${route.date_end}`
}

export function createRouteObject(
  route: JoreRoute,
  alerts?: Alert[],
  cancellations?: Cancellation[],
  duration = 0
): Route {
  return {
    id: createRouteId(route),
    routeId: route.route_id,
    direction: getDirection(route.direction),
    origin: route.origin_fi,
    destination: route.destination_fi,
    name: get(route, 'route_name', get(route, 'name_fi', '')) || '',
    destinationStopId: route.destinationstop_id,
    originStopId: route.originstop_id,
    mode: route.mode,
    routeLength: route.route_length || 0,
    routeDurationMinutes: duration || route.duration || 0,
    alerts: alerts && alerts.length !== 0 ? alerts : [],
    cancellations: cancellations && cancellations.length !== 0 ? cancellations : [],
    // @ts-ignore
    _matchScore: route._matchScore,
  }
}
