import { JoreRouteDepartureData, JoreStop, JoreStopSegment, Mode } from '../../types/Jore'
import { Alert, Stop, StopRoute } from '../../types/generated/schema-types'
import { compact, get, uniq } from 'lodash'

export function createStopObject(
  stop: JoreStop | JoreRouteDepartureData | JoreStopSegment,
  stopRoutes: StopRoute[] = [],
  alerts: Alert[] = []
): Stop {
  const stopModes =
    stop.modes && Array.isArray(stop.modes)
      ? stop.modes
      : typeof stop.modes === 'string'
      ? [stop.modes]
      : stop.mode
      ? [stop.mode]
      : []

  const modes = uniq([...stopModes, ...compact(stopRoutes.map(({ mode }) => mode))])

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
    stopIndex: get(stop, 'stop_index', 0),
    isTimingStop: !!stop.timing_stop_type,
    _matchScore: get(stop, '_matchScore', 0),
  }
}
