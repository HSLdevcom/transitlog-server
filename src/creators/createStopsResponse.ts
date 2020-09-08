import { Stop, StopRoute } from '../types/generated/schema-types'
import { JoreRouteSegment, JoreRouteStop, JoreStop } from '../types/Jore'
import { cacheFetch } from '../cache'
import { createStopObject } from '../objects/createStopObject'
import { filterByDateChains } from '../utils/filterByDateChains'
import { groupBy, orderBy } from 'lodash'
import { getDirection } from '../utils/getDirection'
import { CachedFetcher } from '../types/CachedFetcher'
import { Dictionary } from '../types/Dictionary'

let fetchRouteStops: CachedFetcher<Stop[]> = async (
  type = 'single',
  getStops: () => Promise<JoreRouteStop[]>,
  date: string
) => {
  const stops = await getStops()

  if (!stops || stops.length === 0) {
    return false
  }

  let stopRouteGroups = groupBy<JoreRouteStop>(
    stops,
    (stop) => `${stop.stop_id}_${stop.route_id}_${stop.direction}`
  )

  type JoreRouteStopValidity = JoreRouteStop & { date_begin: string; date_end: string }

  let validStops = filterByDateChains<JoreRouteStopValidity>(
    stopRouteGroups as Dictionary<JoreRouteStopValidity[]>,
    date
  )

  if (!validStops || validStops.length === 0) {
    return false
  }

  // The stops and route segments are joined in the query, so now we need to
  // combine distinct stops with all routes that go through them.
  const stopGroups = groupBy(validStops, 'stop_id')

  const stopData: Array<[JoreRouteStop, StopRoute[]]> = Object.values(stopGroups).map(
    (stops) => {
      const currentStop = stops[0]

      let routes = stops.reduce((stopRoutes: StopRoute[], stop: JoreRouteStop) => {
        if (!stop.route_id) {
          return stopRoutes
        }

        const stopRoute: StopRoute = {
          id: `stop_route_${stop.stop_id}_${stop.route_id}_${stop.direction}_${stop.date_begin}_${stop.date_end}`,
          direction: getDirection(stop.direction),
          routeId: stop.route_id,
          isTimingStop: !!stop.timing_stop_type,
          originStopId: stop.originstop_id,
          name: stop.route_name,
          origin: stop.origin_fi,
          destination: stop.destination_fi,
          distanceFromPrevious: stop.distance_from_previous || 0,
          distanceFromStart: stop.distance_from_start || 0,
          duration: 0,
          stopIndex: stop.stop_index || 0,
          mode: stop.mode,
        }

        stopRoutes.push(stopRoute)
        return stopRoutes
      }, [])

      return [currentStop, routes]
    }
  )

  return stopData.map(([stop, routes]) =>
    createStopObject(stop, routes, [], `${type}_stop_${date}`)
  )
}

export async function createStopResponse(
  getStops: () => Promise<JoreRouteSegment[]>,
  date: string,
  stopId: string,
  skipCache = false
): Promise<Stop | null> {
  const cacheKey = `single_stop_${date}_${stopId}`
  const stops = await cacheFetch<Stop[]>(
    cacheKey,
    () => fetchRouteStops('single', getStops, date),
    30 * 24 * 60 * 60,
    skipCache
  )

  if (!stops || stops.length === 0) {
    return null
  }

  return stops[0]
}

export async function createStopsResponse(
  getStops: () => Promise<JoreRouteSegment[]>,
  date: string,
  skipCache = false
): Promise<Stop[]> {
  const fetchStops: CachedFetcher<Stop[]> = async (
    getStops: () => Promise<Array<JoreStop | JoreRouteStop>>
  ) => {
    const fetchedStops = await getStops()

    if (!fetchedStops || fetchedStops.length === 0) {
      return false
    }

    let validStops = fetchedStops.filter((stop) => !!stop?.short_id)
    return validStops.map((stop) => createStopObject(stop, [], [], 'simple_stop'))
  }

  const cacheKey = `all_stops_${date}`
  const stops = await cacheFetch<Stop[]>(
    cacheKey,
    () => fetchStops(getStops),
    30 * 24 * 60 * 60,
    skipCache
  )

  if (!stops) {
    return []
  }

  return stops
}

export async function createRouteStopsResponse(
  getStops: () => Promise<JoreRouteSegment[]>,
  routeId: string,
  direction: number,
  date: string,
  skipCache = false
): Promise<Stop[]> {
  const cacheKey = `route_stops_${date}_${routeId}_${direction}`
  const stops = await cacheFetch<Stop[]>(
    cacheKey,
    () => fetchRouteStops('route', getStops, date),
    30 * 24 * 60 * 60,
    skipCache
  )

  if (!stops) {
    return []
  }

  return orderBy(stops, (stop) => stop.routes[0]?.stopIndex)
}
