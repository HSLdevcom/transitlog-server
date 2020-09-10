import { JoreRouteStop, JoreStop } from '../types/Jore'
import { Alert, RouteStop, Stop, StopRoute } from '../types/generated/schema-types'
import { get } from 'lodash'
import { validModes } from '../utils/validModes'

export function createRouteStopObject(
  stop: JoreStop | JoreRouteStop,
  stopRoutes: StopRoute[] = [],
  alerts: Alert[] = [],
  prefix = 'route_stop'
): RouteStop {
  return {
    id: `${prefix}_${stop.stop_id}`,
    stopId: stop.stop_id + '',
    shortId: stop.short_id,
    lat: stop.lat,
    lng: stop.lon,
    name: stop.name_fi,
    radius: stop.stop_radius,
    routes: stopRoutes,
    alerts,
  }
}

export function createStopObject(
  stop: JoreStop | JoreRouteStop,
  alerts: Alert[] = [],
  prefix = 'stop'
): Stop {
  const stopModes = validModes(get(stop, 'modes', get(stop, 'mode', '')))

  return {
    id: `${prefix}_${stop.stop_id}`,
    stopId: stop.stop_id + '',
    shortId: stop.short_id,
    lat: stop.lat,
    lng: stop.lon,
    name: stop.name_fi,
    radius: stop.stop_radius,
    modes: stopModes,
    alerts,
    _matchScore: get(stop, '_matchScore', 0),
  }
}
