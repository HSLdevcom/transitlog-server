import { JoreRouteDepartureData, JoreStop, Mode } from '../../types/Jore'
import { SimpleStop, Stop, StopRoute } from '../../types/generated/schema-types'

export function createSimpleStopObject(stop: JoreStop | JoreRouteDepartureData): SimpleStop {
  return {
    id: stop.stop_id,
    stopId: stop.stop_id,
    shortId: stop.short_id,
    lat: stop.lat,
    lng: stop.lon,
    name: stop.name_fi,
    radius: stop.stop_radius,
    modes: stop.modes || [Mode.Bus],
    // @ts-ignore
    _matchScore: stop._matchScore,
  }
}

export function createStopObject(
  stop: JoreStop | JoreRouteDepartureData,
  stopRoutes: StopRoute[] = []
): Stop {
  return {
    id: stop.stop_id,
    stopId: stop.stop_id,
    shortId: stop.short_id,
    lat: stop.lat,
    lng: stop.lon,
    name: stop.name_fi,
    radius: stop.stop_radius,
    modes: stop.modes || [Mode.Bus],
    routes: stopRoutes,
  }
}
