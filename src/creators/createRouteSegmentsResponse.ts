import { groupBy, sortBy, get } from 'lodash'
import { filterByDateChains } from '../utils/filterByDateChains'
import { JoreRouteData } from '../types/Jore'
import { cacheFetch } from '../cache'
import { Scalars, RouteSegment } from '../types/generated/schema-types'
import { createRouteSegmentObject } from '../objects/createRouteSegmentObject'
import { requireUser } from '../auth/requireUser'

// Filter out any additional stops from the start or end of the route that may be
// invalid even though the stop itself is still valid. This is because our JORE
// database never removes records, and sometimes invalid items persist. Anything
// before the true origin stop or after the true destination stop is removed.
function trimRouteSegments(routeSegments: JoreRouteData[]) {
  let trimmedSegments = routeSegments

  const { destinationstop_id = '' } = trimmedSegments[0] || {}

  const realLastStopIndex = trimmedSegments.findIndex(
    (rs) => rs.stop_id === destinationstop_id
  )

  if (realLastStopIndex !== -1) {
    trimmedSegments = trimmedSegments.slice(0, realLastStopIndex + 1)
  }

  return trimmedSegments
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
    const routes = await getRouteSegments()
    const validRoutes = filterByDateChains<JoreRouteData>(groupBy(routes, 'stop_index'), date)

    if (!validRoutes || validRoutes.length === 0) {
      return false
    }

    // Sorted by the order of the stops in the journey.
    let routeSegments: JoreRouteData[] = sortBy(validRoutes, 'stop_index')
    routeSegments = trimRouteSegments(routeSegments)

    const alerts = await getAlerts(date, {
      allStops: true,
      stop: true,
    })

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
        const segmentAlerts = alerts.filter(
          (alert) => alert.affectedId === routeSegment.stop_id
        )

        // Merge the route segment and the stop data, picking what we need from the segment and
        // the stop. What we really need from the segment is the timing stop type and the stop index.
        return createRouteSegmentObject(routeSegment, null, segmentAlerts, cancellations)
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
