import { BBox, SimpleStop, Stop, StopFilterInput, StopRoute } from '../types/generated/schema-types'
import { JoreLine, JoreRoute, JoreRouteSegment, JoreStop } from '../types/Jore'
import { cacheFetch } from './cache'
import { createSimpleStopObject, createStopObject } from './objects/createStopObject'
import { search } from './filters/search'
import { filterByDateChains } from '../utils/filterByDateChains'
import { groupBy, uniqBy, orderBy } from 'lodash'
import { getDirection } from '../utils/getDirection'
import { CachedFetcher } from '../types/CachedFetcher'

function getSearchValue(item) {
  const { stopId = '', shortId = '', name = '' } = item
  return stopId ? [stopId, shortId, name] : []
}

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

    stopRoutes = orderBy(stopRoutes, 'route_id')
    return createStopObject(validStops[0], stopRoutes)
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
): Promise<SimpleStop[]> {
  const fetchStops: CachedFetcher<SimpleStop[]> = async () => {
    const fetchedStops = await getStops()

    if (!fetchedStops || fetchedStops.length === 0) {
      return false
    }

    return fetchedStops.map((stop) => {
      return createSimpleStopObject(stop)
    })
  }

  // Create a separate cache key for bbox queries.
  const bboxStr = Object.values(bbox).join(',')
  const cacheKey = `stops${bbox ? `_bbox_${bboxStr}` : ''}`
  const stops = await cacheFetch<SimpleStop[]>(cacheKey, fetchStops, bbox ? 5 * 60 : 24 * 60 * 60)

  if (!stops) {
    return []
  }

  let filteredStops = stops

  if (filter && filter.search) {
    filteredStops = search<SimpleStop>(stops, filter.search, getSearchValue)
  }

  return filteredStops
}
