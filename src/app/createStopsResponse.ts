import { BBox, SimpleStop, Stop, StopFilterInput, StopRoute } from '../types/generated/schema-types'
import { JoreLine, JoreRoute, JoreRouteSegment, JoreStop } from '../types/Jore'
import { cacheFetch } from './cache'
import { createSimpleStopObject, createStopObject } from './objects/createStopObject'
import { search } from './filters/search'
import { filterByDateChains } from '../utils/filterByDateChains'
import { groupBy, orderBy, uniqBy } from 'lodash'
import { getDirection } from '../utils/getDirection'
import { CachedFetcher } from '../types/CachedFetcher'
import { getAlerts } from './getAlerts'
import format from 'date-fns/format'
import { filterStopsByBBox } from './filters/filterStopsByBBox'

// Result from the query is a join of a stop and route segments.
type JoreCombinedStop = JoreStop & JoreRouteSegment & JoreRoute & JoreLine

export async function createStopResponse(
  getStops: () => Promise<JoreCombinedStop[]>,
  date: string,
  stopId: string
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

    let stopRoutes = validStops.reduce((routes: StopRoute[], stopRouteData: JoreCombinedStop) => {
      const stopRoute: StopRoute = {
        id: `stop_route_${stopRouteData.route_id}_${stopRouteData.direction}_${
          stopRouteData.date_begin
        }_${stopRouteData.date_end}`,
        lineId: stopRouteData.line_id,
        direction: getDirection(stopRouteData.direction),
        routeId: stopRouteData.route_id,
        isTimingStop: !!stopRouteData.timing_stop_type,
        originStopId: stopRouteData.originstop_id,
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
  const stop = await cacheFetch<Stop>(cacheKey, fetchStop)

  if (!stop) {
    return null
  }

  stop.alerts = getAlerts(date, {
    allStops: true,
    stop: stop.stopId,
    allRoutes: true,
    route: stop.routes && stop.routes.length ? stop.routes.map(({ routeId }) => routeId) : '',
  })

  return stop
}

export async function createStopsResponse(
  getStops: () => Promise<JoreStop[]>,
  filter?: StopFilterInput,
  bbox: BBox | null = null
): Promise<SimpleStop[]> {
  const fetchStops: CachedFetcher<SimpleStop[]> = async () => {
    const fetchedStops = await getStops()

    if (!fetchedStops || fetchedStops.length === 0) {
      return false
    }

    return fetchedStops.map((stop) => createSimpleStopObject(stop))
  }

  const cacheKey = 'stops'
  const stops = await cacheFetch<SimpleStop[]>(cacheKey, fetchStops, 24 * 60 * 60)

  if (!stops) {
    return []
  }

  let filteredStops = stops

  if (bbox) {
    filteredStops = filterStopsByBBox(filteredStops, bbox)
  }

  if (filter && filter.search) {
    filteredStops = search<SimpleStop>(stops, filter.search, [
      { name: 'shortId', weight: 0.7 },
      { name: 'name', weight: 0.1 },
      { name: 'stopId', weight: 0.2 },
    ])
  }

  const currentTime = format(new Date(), 'YYYY-MM-DD')

  filteredStops = filteredStops.map((stop) => {
    stop.alerts = getAlerts(currentTime, { allStops: true, stop: stop.stopId })
    return stop
  })

  return filteredStops
}
