import { Stop, StopRoute } from '../types/generated/schema-types'
import { JoreRouteData } from '../types/Jore'
import { cacheFetch } from '../cache'
import { createStopObject } from '../objects/createStopObject'
import { filterByDateChains } from '../utils/filterByDateChains'
import { groupBy, orderBy, uniqBy } from 'lodash'
import { getDirection } from '../utils/getDirection'
import { CachedFetcher } from '../types/CachedFetcher'

export async function createStopResponse(
  getStops: () => Promise<JoreRouteData[]>,
  date: string,
  stopId: string,
  skipCache = false
): Promise<Stop | null> {
  const fetchStop: CachedFetcher<Stop> = async () => {
    const stops = await getStops()

    if (!stops || stops.length === 0) {
      return false
    }

    let stopRouteGroups = groupBy<JoreRouteData>(stops, (segment) =>
      !segment.route_id ? segment.stop_id : segment.route_id + segment.direction
    )

    let validStops = filterByDateChains<JoreRouteData>(stopRouteGroups, date)

    validStops = uniqBy<JoreRouteData>(validStops, (stop) =>
      !stop?.route_id ? stop.stop_id : stop?.route_id || 'no_route'
    )

    if (!validStops || validStops.length === 0) {
      return false
    }

    let stopRoutes = validStops.reduce((routes: StopRoute[], stopRouteData: JoreRouteData) => {
      if (!stopRouteData?.route_id) {
        return routes
      }

      const stopRoute: StopRoute = {
        id: `stop_route_${stopRouteData.route_id}_${stopRouteData.direction}_${stopRouteData.date_begin}_${stopRouteData.date_end}`,
        direction: getDirection(stopRouteData.direction),
        routeId: stopRouteData.route_id,
        isTimingStop: !!stopRouteData.timing_stop_type,
        originStopId: stopRouteData.originstop_id,
        name: stopRouteData.route_name,
        origin: stopRouteData.origin_fi,
        destination: stopRouteData.destination_fi,
        mode: stopRouteData.mode || 'BUS',
      }

      routes.push(stopRoute)
      return routes
    }, [])

    const stop = validStops[0]
    stopRoutes = orderBy(stopRoutes, 'route_id')
    return createStopObject(stop, stopRoutes)
  }

  const cacheKey = `stop_${date}_${stopId}`
  const stop = await cacheFetch<Stop>(cacheKey, fetchStop, 30 * 24 * 60 * 60, skipCache)

  if (!stop) {
    return null
  }

  return stop
}

export async function createStopsResponse(
  getStops: () => Promise<JoreRouteData[]>,
  date?: string,
  skipCache = false
): Promise<Stop[]> {
  const fetchStops: CachedFetcher<Stop[]> = async () => {
    const fetchedStops = await getStops()

    if (!fetchedStops || fetchedStops.length === 0) {
      return false
    }

    // The stops and route segments are joined in the query, so now we need to
    // combine distinct stops with all routes that go through them.
    const stopGroups = groupBy(fetchedStops, 'stop_id')

    const stopData = Object.values(stopGroups).map((stops) => {
      const currentStop = stops[0]

      currentStop.routes = stops.reduce((stopRoutes: StopRoute[], stop: JoreRouteData) => {
        if (!stop.route_id) {
          return stopRoutes
        }

        const stopRoute: StopRoute = {
          id: `stop_route_${stop.route_id}_${stop.direction}_${stop.date_begin}_${stop.date_end}`,
          direction: getDirection(stop.direction),
          routeId: stop.route_id,
          isTimingStop: !!stop.timing_stop_type,
          originStopId: stop.originstop_id,
          name: stop.route_name,
          origin: stop.origin_fi,
          destination: stop.destination_fi,
          mode: Array.isArray(stop.modes) ? stop.modes[0] : stop.modes,
        }

        stopRoutes.push(stopRoute)
        return stopRoutes
      }, [])

      return currentStop
    })

    return stopData.map((stop) => createStopObject(stop, stop.routes, []))
  }

  const cacheKey = `stops_${date || 'undated'}`
  const stops = await cacheFetch<Stop[]>(cacheKey, fetchStops, 30 * 24 * 60 * 60, skipCache)

  if (!stops) {
    return []
  }

  return stops
}
