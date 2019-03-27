import { get, groupBy, sortBy } from 'lodash'
import { filterByDateChains } from '../utils/filterByDateChains'
import { Route as JoreRoute, RouteSegment as JoreRouteSegment } from '../types/generated/jore-types'
import { cacheFetch } from './cache'
import { Direction, RouteSegment } from '../types/generated/schema-types'
import { createStopObject } from './objects/createStopObject'
import { getDirection } from '../utils/getDirection'
import { createRouteSegmentObject } from './objects/createRouteSegmentObject'

export async function createRouteSegmentsResponse(
  getRouteSegments: () => Promise<JoreRoute[]>,
  date: string,
  routeId: string,
  direction: Direction
): Promise<RouteSegment[]> {
  const fetchAndValidate = async () => {
    const routes = await getRouteSegments()
    const validRoutes = filterByDateChains<JoreRoute>({ routes }, date)
    const selectedRoute = validRoutes ? validRoutes[0] : null

    if (!selectedRoute) {
      return false
    }

    const routeSegments: JoreRouteSegment[] = get(selectedRoute, 'routeSegments.nodes', []) || []

    const validRouteSegments = filterByDateChains<JoreRouteSegment>(
      groupBy(routeSegments, 'stopIndex'),
      date
    )

    const sortedRouteSegments = sortBy(validRouteSegments, 'stopIndex')

    // The sorted array of segments can then be further reduced to segment and stop combos.
    // This returns an array of objects which have data from both the stop and the route
    // segment. Crucially, the segment carries the information about which stop is a
    // timing stop. The segment can be seen as the "glue" between the journey and
    // the stops, since stops are otherwise oblivious to route-specific things.
    return sortedRouteSegments.map(
      (routeSegment): RouteSegment => {
        // Merge the route segment and the stop data, picking what we need from the segment and
        // splatting the stop. What we really need from the segment is the timing stop type and
        // the stop index. The departures will later be matched with actually observed events.
        return createRouteSegmentObject(routeSegment, selectedRoute)
      }
    )
  }

  const cacheKey = `routeSegments_${routeId}_${direction}_${date}`
  const validRouteSegments = await cacheFetch<RouteSegment[]>(
    cacheKey,
    fetchAndValidate,
    24 * 60 * 60
  )

  if (!validRouteSegments) {
    return []
  }

  return validRouteSegments
}
