import { Stop as JoreStop } from '../../types/generated/jore-types'
import { Stop, StopRoute } from '../../types/generated/schema-types'

export function createStopObject(stop: JoreStop, stopRoutes: StopRoute[] = []): Stop {
  return {
    id: stop.stopId,
    stopId: stop.stopId,
    shortId: stop.shortId,
    lat: stop.lat,
    lng: stop.lon,
    name: stop.nameFi,
    radius: stop.stopRadius,
    modes: stop.modes.nodes,
    routes: stopRoutes,
    // @ts-ignore
    _matchScore: stop._matchScore,
  }
}
