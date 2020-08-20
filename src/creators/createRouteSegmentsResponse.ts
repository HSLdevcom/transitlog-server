import { sortBy } from 'lodash'
import { JoreRouteData } from '../types/Jore'
import { cacheFetch } from '../cache'
import { RouteSegment, Scalars } from '../types/generated/schema-types'
import { createRouteSegmentObject } from '../objects/createRouteSegmentObject'
import { requireUser } from '../auth/requireUser'
import { filterByDateGroups } from '../utils/filterByDateGroups'

// Filter out any additional stops from the start and end of the route that may be
// invalid even though the stop itself is still valid. This is because
// our JORE database never removes records, and sometimes invalid items
// persist. Anything before the origin stop or after the destination stop is removed.
export function trimRouteSegments(routeSegments: JoreRouteData[]) {
  // Remove all stops before the originstop_id.
  // Remove all stops after the first encountered stop with a null next_stop_id. This means that the route has ended.
  let filteredSegments = routeSegments.reduce((routeChain: JoreRouteData[], routeStop) => {
    if (
      // Only add the first stop if it matches the originstop_id.
      (routeChain.length === 0 && routeStop.originstop_id === routeStop.stop_id) ||
      // Otherwise add stops until the last stop in the chain has a null next_stop_id.
      !!routeChain[routeChain.length - 1].next_stop_id
    ) {
      routeChain.push(routeStop)
    }

    return routeChain
  }, [])

  if (filteredSegments.length !== 0) {
    return filteredSegments
  }

  // If the filter left the segments array empty, just return the original segments.
  return routeSegments
}

export async function createRouteSegmentsResponse(
  user,
  getRouteSegments: () => Promise<JoreRouteData[]>,
  getCancellations,
  getAlerts,
  date: string,
  routeId: string,
  direction: Scalars['Direction'],
  skipCache = false
): Promise<RouteSegment[]> {
  const fetchAndValidate = async () => {
    let routes = await getRouteSegments()
    let validRoutes = filterByDateGroups<JoreRouteData>(routes, date)

    if (!validRoutes || validRoutes.length === 0) {
      return false
    }

    // Sorted by the order of the stops in the journey.
    let routeSegments: JoreRouteData[] = sortBy(validRoutes, 'stop_index')

    const cancellations = await getCancellations(
      date,
      {
        routeId,
        direction,
      },
      skipCache
    )

    // The sorted array of segments can then be further reduced to segment and stop combos.
    // This returns an array of objects which have data from both the stop and the route
    // segment. Crucially, the segment carries the information about which stop is a
    // timing stop. The segment can be seen as the "glue" between the journey and
    // the stops, since stops are otherwise oblivious to route-specific things.
    return routeSegments.map(
      (routeSegment): RouteSegment => {
        // Merge the route segment and the stop data, picking what we need from the segment and
        // the stop. What we really need from the segment is the timing stop type and the stop index.
        return createRouteSegmentObject(routeSegment, null, [], cancellations)
      }
    )
  }

  const cacheKey = `routeSegments_${routeId}_${direction}_${date}_${
    requireUser(user, 'HSL') ? 'HSL_authorized' : 'unauthorized'
  }`

  const validRouteSegments = await cacheFetch<RouteSegment[]>(
    cacheKey,
    fetchAndValidate,
    30 * 24 * 60 * 60,
    skipCache
  )

  if (!validRouteSegments) {
    return []
  }

  return validRouteSegments
}
