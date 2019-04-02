import { BBox, Stop, StopFilterInput, StopRoute } from '../types/generated/schema-types'
import { JoreRouteSegment, JoreStop } from '../types/Jore'
import { cacheFetch } from './cache'
import { createStopObject } from './objects/createStopObject'
import { search } from './filters/search'
import { filterByDateChains } from '../utils/filterByDateChains'
import { get, groupBy, uniqBy, orderBy } from 'lodash'
import { getDirection } from '../utils/getDirection'
import { CachedFetcher } from '../types/CachedFetcher'

function getSearchValue(item) {
  const { stopId = '', shortId = '', name = '' } = item
  return stopId ? [stopId, shortId, name] : []
}

export async function createStopResponse(
  getStop: () => Promise<JoreStop>,
  date: string,
  stopId: string
): Promise<Stop | null> {
  const fetchStop: CachedFetcher<Stop> = async () => {
    const stop = await getStop()

    if (!stop) {
      return false
    }

    let validRouteSegments = filterByDateChains<JoreRouteSegment>(
      groupBy<JoreRouteSegment>(
        get(stop, 'routeSegments.nodes', []),
        (segment) => segment.route_id + segment.direction + segment.stop_index
      ),
      date
    )

    validRouteSegments = uniqBy<JoreRouteSegment>(validRouteSegments, 'route_id')

    if (!validRouteSegments || validRouteSegments.length === 0) {
      return false
    }

    let stopRoutes = validRouteSegments.reduce((routes: StopRoute[], segment) => {
      // The route segment should only have one route, so no validation is necessary.
      const route = get(segment, 'route.nodes', [])[0]

      if (!route) {
        return routes
      }

      const stopRoute: StopRoute = {
        id: `stop_route_${route.route_id}_${route.direction}_${route.date_begin}_${route.date_end}`,
        lineId: get(route, 'line.nodes[0].line_id', ''),
        direction: getDirection(route.direction),
        routeId: route.route_id,
        isTimingStop: !!segment.timing_stop_type,
        originStopId: route.originstop_id,
      }

      routes.push(stopRoute)
      return routes
    }, [])

    stopRoutes = orderBy(stopRoutes, 'route_id')
    return createStopObject(stop, stopRoutes)
  }

  const cacheKey = `stop_${date}_${stopId}`
  const stop = await cacheFetch<Stop>(cacheKey, fetchStop)

  if (!stop) {
    return null
  }

  return stop
}

export async function createStopsResponse(
  getStops: () => Promise<JoreStop[]>,
  filter?: StopFilterInput,
  bbox: BBox = {}
): Promise<Stop[]> {
  const fetchStops: CachedFetcher<Stop[]> = async () => {
    const stops = await getStops()

    if (!stops || stops.length === 0) {
      return false
    }

    return stops.map((stop) => createStopObject(stop))
  }

  // Create a separate cache key for bbox queries.
  const bboxStr = Object.values(bbox).join(',')
  const cacheKey = `stops${bbox ? `_bbox_${bboxStr}` : ''}`
  const stops = await cacheFetch<Stop[]>(cacheKey, fetchStops, bbox ? 5 * 60 : 24 * 60 * 60)

  if (!stops) {
    return []
  }

  let filteredStops = stops

  if (filter && filter.search) {
    filteredStops = search<Stop>(stops, filter.search, getSearchValue)
  }

  return filteredStops
}
