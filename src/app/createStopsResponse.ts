import { Stop, StopFilterInput, StopRoute } from '../types/generated/schema-types'
import { Route, RouteSegment, Stop as JoreStop } from '../types/generated/jore-types'
import { cacheFetch } from './cache'
import { createStopObject } from './objects/createStopObject'
import { filterStopsByBBox } from './filters/filterStopsByBBox'
import { search } from './filters/search'
import { filterByDateChains } from '../utils/filterByDateChains'
import { get, groupBy, uniqBy, orderBy } from 'lodash'
import { getDirection } from '../utils/getDirection'

function getSearchValue(item) {
  const { stopId = '', shortId = '', nameFi = '' } = item
  return stopId ? [stopId, shortId, nameFi] : []
}

export async function createStopsResponse(
  getStops: () => Promise<JoreStop[]>,
  date: string,
  filter?: StopFilterInput
): Promise<Stop[]> {
  const cacheKey = `stops`
  const stops = await cacheFetch<JoreStop[]>(cacheKey, getStops, 86400)

  if (!stops) {
    return []
  }

  let filteredStops = stops

  if (filter && (filter.bbox || filter.search || filter.stopId)) {
    filteredStops = []

    if (filter.stopId) {
      filteredStops = stops.filter((stop) => stop.stopId === filter.stopId)
    } else {
      if (filter.bbox) {
        filteredStops = filterStopsByBBox(stops, filter.bbox)
      }

      if (filter.search) {
        filteredStops = search<JoreStop>(stops, filter.search, getSearchValue)
      }
    }
  }

  function createStopRoutes(stop): StopRoute[] {
    let validRouteSegments = filterByDateChains<RouteSegment>(
      groupBy(
        get(stop, 'routeSegments.nodes', []),
        (segment) => segment.routeId + segment.direction + segment.stopIndex
      ),
      date
    )

    validRouteSegments = uniqBy(validRouteSegments, 'routeId')

    if (!validRouteSegments || validRouteSegments.length === 0) {
      return []
    }

    return validRouteSegments.reduce((stopRoutes: StopRoute[], segment) => {
      // The route segment should only have one route, so no validation is necessary.
      const route = get(segment, 'route.nodes', [])[0]

      if (!route) {
        return stopRoutes
      }

      const stopRoute: StopRoute = {
        lineId: get(route, 'line.nodes[0].lineId', ''),
        direction: getDirection(route.direction),
        routeId: route.routeId,
        isTimingStop: !!segment.timingStopType,
        originStopId: route.originstopId,
      }

      stopRoutes.push(stopRoute)
      return stopRoutes
    }, [])
  }

  return filteredStops.map((stop) => {
    const stopRoutes = orderBy(createStopRoutes(stop), 'routeId')
    return createStopObject(stop, stopRoutes)
  })
}
