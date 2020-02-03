import { JoreRouteDepartureData, JoreStop, JoreStopSegment, Mode } from '../types/Jore'
import { Alert, Stop, StopRoute } from '../types/generated/schema-types'
import { compact, get, uniq } from 'lodash'
import { validModes } from '../utils/validModes'

export function createStopObject(
  stop: JoreStop | JoreRouteDepartureData | JoreStopSegment,
  stopRoutes: StopRoute[] = [],
  alerts: Alert[] = []
): Stop {
  const stopModes = validModes(stop.modes, stop.mode, ...stopRoutes)

  return {
    id: stop.stop_id,
    stopId: stop.stop_id + '',
    shortId: stop.short_id,
    lat: stop.lat,
    lng: stop.lon,
    name: stop.name_fi,
    radius: stop.stop_radius,
    modes: stopModes,
    routes: stopRoutes,
    alerts,
    stopIndex: get(stop, 'stop_index', 0),
    isTimingStop: !!stop.timing_stop_type,
    _matchScore: get(stop, '_matchScore', 0),
  }
}
