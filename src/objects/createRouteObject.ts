import { Cancellation, Route } from '../types/generated/schema-types'
import { JoreRoute, JoreRouteStop } from '../types/Jore'
import { get } from 'lodash'
import { getDirection } from '../utils/getDirection'
import { validModes } from '../utils/validModes'

interface RouteLike {
  route_id: string
  direction: string | number
  date_begin: string
  date_end: string
}

function createRouteId(route: RouteLike): string {
  return `${route.route_id}_${route.direction}_${route.date_begin}_${route.date_end}`
}

export function createRouteObject(
  route: JoreRoute | JoreRouteStop,
  cancellations?: Cancellation[],
  duration = 0
): Route {
  const mode = validModes(route?.mode)

  return {
    id: createRouteId(route),
    routeId: route.route_id,
    direction: getDirection(route.direction),
    origin: route.origin_fi,
    destination: route.destination_fi,
    name: get(route, 'route_name', get(route, 'name_fi', '')) || '',
    destinationStopId: route.destinationstop_id,
    originStopId: route.originstop_id,
    mode: mode[0],
    routeLength: route.route_length || 0,
    routeDurationMinutes: duration || 0,
    alerts: [],
    cancellations: cancellations && cancellations.length !== 0 ? cancellations : [],
    // @ts-ignore
    _matchScore: route._matchScore,
  }
}
