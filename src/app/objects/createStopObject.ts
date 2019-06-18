import { JoreRouteDepartureData, JoreStop, JoreStopSegment, Mode } from '../../types/Jore'
import { Alert, SimpleStop, Stop, StopRoute } from '../../types/generated/schema-types'
import { get, uniq, compact } from 'lodash'

export function createSimpleStopObject(
  stop: JoreStop | JoreStopSegment,
  alerts: Alert[] = []
): SimpleStop {
  const mode = get(stop, 'modes', get(stop, 'mode', Mode.Bus))

  return {
    id: stop.stop_id,
    stopId: stop.stop_id,
    shortId: stop.short_id,
    lat: stop.lat,
    lng: stop.lon,
    name: stop.name_fi,
    radius: stop.stop_radius,
    modes: mode ? [mode] : [Mode.Bus],
    alerts,
    routes: stop.routes || [],
    // @ts-ignore
    _matchScore: stop._matchScore,
  }
}

export function createStopObject(
  stop: JoreStop | JoreRouteDepartureData,
  stopRoutes: StopRoute[] = [],
  alerts: Alert[] = []
): Stop {
  const modes = uniq(compact(stopRoutes.map(({ mode }) => mode)))

  if (modes.length === 0) {
    modes.push(Mode.Bus)
  }

  return {
    id: stop.stop_id,
    stopId: stop.stop_id,
    shortId: stop.short_id,
    lat: stop.lat,
    lng: stop.lon,
    name: stop.name_fi,
    radius: stop.stop_radius,
    modes,
    routes: stopRoutes,
    alerts,
  }
}
