import { groupBy, sortBy } from 'lodash'
import { filterByDateChains } from '../utils/filterByDateChains'
import { JoreRouteData } from '../types/Jore'
import { cacheFetch } from '../cache'
import { Direction, RouteSegment } from '../types/generated/schema-types'
import { createRouteSegmentObject } from '../objects/createRouteSegmentObject'
import { requireUser } from '../auth/requireUser'

export async function createRouteSegmentsResponse(
  user,
  getRouteSegments: () => Promise<JoreRouteData[]>,
  getCancellations,
  getAlerts,
  date: string,
  routeId: string,
  direction: Direction
): Promise<RouteSegment[]> {
  const fetchAndValidate = async () => {
    const routes = await getRouteSegments()
    const validRoutes = filterByDateChains<JoreRouteData>(groupBy(routes, 'stop_index'), date)

    if (!validRoutes || validRoutes.length === 0) {
      return false
    }

    const sortedRouteSegments = sortBy(validRoutes, 'stop_index')

    const alerts = await getAlerts(date, {
      allStops: true,
      stop: true,
    })

    const cancellations = await getCancellations(date, {
      routeId,
      direction,
    })

    // The sorted array of segments can then be further reduced to segment and stop combos.
    // This returns an array of objects which have data from both the stop and the route
    // segment. Crucially, the segment carries the information about which stop is a
    // timing stop. The segment can be seen as the "glue" between the journey and
    // the stops, since stops are otherwise oblivious to route-specific things.
    return sortedRouteSegments.map(
      (routeSegment): RouteSegment => {
        const segmentAlerts = alerts.filter(
          (alert) => alert.affectedId === routeSegment.stop_id
        )

        // Merge the route segment and the stop data, picking what we need from the segment and
        // splatting the stop. What we really need from the segment is the timing stop type and
        // the stop index. The departures will later be matched with actually observed events.
        return createRouteSegmentObject(routeSegment, null, segmentAlerts, cancellations)
      }
    )
  }

  const cacheKey = `routeSegments_${routeId}_${direction}_${date}_${
    requireUser(user, 'HSL') ? 'HSL_authorized' : 'unauthorized'
  }`

  const validRouteSegments = await cacheFetch<RouteSegment[]>(cacheKey, fetchAndValidate)

  if (!validRouteSegments) {
    return []
  }

  return validRouteSegments
}
