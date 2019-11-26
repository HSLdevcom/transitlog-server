import { Scalars, Stop, StopFilterInput, StopRoute } from '../types/generated/schema-types'
import { JoreRoute, JoreRouteSegment, JoreStop } from '../types/Jore'
import { cacheFetch } from '../cache'
import { createStopObject } from '../objects/createStopObject'
import { search } from '../filters/search'
import { filterByDateChains } from '../utils/filterByDateChains'
import { groupBy, orderBy, uniqBy } from 'lodash'
import { getDirection } from '../utils/getDirection'
import { CachedFetcher } from '../types/CachedFetcher'
import { filterStopsByBBox } from '../filters/filterStopsByBBox'
import { ValidityRange } from '../types/ValidityRange'
import { Dictionary } from '../types/Dictionary'

// Result from the query is a join of a stop and route segments.
type JoreCombinedStop = JoreStop & JoreRouteSegment & JoreRoute

export async function createStopResponse(
  getStops: () => Promise<JoreCombinedStop[]>,
  getAlerts,
  date: string,
  stopId: string,
  skipCache = false
): Promise<Stop | null> {
  const fetchStop: CachedFetcher<Stop> = async () => {
    const stops = await getStops()

    if (!stops || stops.length === 0) {
      return false
    }

    let validStops = filterByDateChains<JoreCombinedStop>(
      groupBy<JoreCombinedStop>(
        stops,
        (segment) => segment.route_id + segment.direction + segment.stop_index
      ),
      date
    )

    validStops = uniqBy<JoreCombinedStop>(validStops, 'route_id')

    if (!validStops || validStops.length === 0) {
      return false
    }

    let stopRoutes = validStops.reduce(
      (routes: StopRoute[], stopRouteData: JoreCombinedStop) => {
        const stopRoute: StopRoute = {
          id: `stop_route_${stopRouteData.route_id}_${stopRouteData.direction}_${stopRouteData.date_begin}_${stopRouteData.date_end}`,
          direction: getDirection(stopRouteData.direction),
          routeId: stopRouteData.route_id,
          isTimingStop: !!stopRouteData.timing_stop_type,
          originStopId: stopRouteData.originstop_id,
          mode: stopRouteData.mode || 'BUS',
        }

        routes.push(stopRoute)
        return routes
      },
      []
    )

    const stop = validStops[0]
    stopRoutes = orderBy(stopRoutes, 'route_id')
    return createStopObject(stop, stopRoutes)
  }

  const cacheKey = `stop_${date}_${stopId}`
  const stop = await cacheFetch<Stop>(cacheKey, fetchStop, 30 * 24 * 60 * 60, skipCache)

  if (!stop) {
    return null
  }

  stop.alerts = await getAlerts(date, {
    allStops: true,
    stop: stop.stopId,
  })

  return stop
}

export async function createStopsResponse(
  getStops: () => Promise<JoreStop[]>,
  getAlerts,
  date?: string,
  filter?: StopFilterInput,
  bbox: Scalars['BBox'] | null = null,
  skipCache = false
): Promise<Stop[]> {
  const fetchStops: CachedFetcher<Stop[]> = async () => {
    const fetchedStops = await getStops()

    if (!fetchedStops || fetchedStops.length === 0) {
      return false
    }

    let stopData = fetchedStops

    // The stop data also contains route segments which we must filter by validity date.
    if (date && fetchedStops.some(({ date_begin, date_end }) => !!date_begin && !!date_end)) {
      const filteredStops = filterByDateChains<JoreStop & ValidityRange>(
        groupBy(
          stopData,
          (stop) => stop.stop_id + stop.route_id + stop.direction
        ) as Dictionary<Array<JoreStop & ValidityRange>>,
        date
      )

      // The stops and route segments are cross-merged in the query, so now we need to
      // combine distinct stops with all routes that go through them.
      stopData = filteredStops.reduce((stopsWithRoutes: JoreStop[], stop) => {
        const existingStop = stopsWithRoutes.find(({ stop_id }) => stop_id === stop.stop_id)

        // If there's no route info then the routes array on the stop object should be empty.
        if (
          (typeof stop.route_id === 'undefined' || typeof stop.direction === 'undefined') &&
          !existingStop
        ) {
          stop.routes = []
          stopsWithRoutes.push(stop)
          return stopsWithRoutes
        }

        // Either add the route data from the current item to an existing stop object
        // or use the current item as a new stop object.
        const useStop = existingStop || stop
        useStop.routes = useStop.routes || []

        // We only need some route data for the stop response.
        const route: StopRoute | null = stop.route_id
          ? {
              id: `stop_route_${stop.route_id}_${stop.route_id}_${stop.date_begin}_${stop.date_end}`,
              routeId: stop.route_id || '',
              direction: getDirection(stop.direction),
              isTimingStop: !!stop.timing_stop_type,
              mode: Array.isArray(stop.modes) ? stop.modes[0] : stop.modes,
            }
          : null

        // Add the route to the stop if it doesn't have it already
        if (
          route &&
          !useStop.routes.find(
            ({ routeId, direction }) =>
              routeId === route.routeId && direction === route.direction
          )
        ) {
          useStop.routes.push(route)
        }

        if (!existingStop) {
          stopsWithRoutes.push(useStop)
        }

        return stopsWithRoutes
      }, [])
    }

    return stopData.map((stop) => createStopObject(stop, stop.routes, []))
  }

  const cacheKey = `stops_${date || 'undated'}`
  const stops = await cacheFetch<Stop[]>(cacheKey, fetchStops, 30 * 24 * 60 * 60, skipCache)

  if (!stops) {
    return []
  }

  let filteredStops = stops

  if (bbox) {
    filteredStops = filterStopsByBBox(filteredStops, bbox)
  }

  if (filter && filter.search) {
    filteredStops = search<Stop>(stops, filter.search, [
      { name: 'shortId', weight: 0.7 },
      { name: 'name', weight: 0.1 },
      { name: 'stopId', weight: 0.2 },
    ])
  }

  return filteredStops
}
