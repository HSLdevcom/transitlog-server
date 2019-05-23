import { groupBy } from 'lodash'
import { filterByDateChains } from '../utils/filterByDateChains'
import { createRouteObject } from './objects/createRouteObject'
import { JoreRoute } from '../types/Jore'
import { Route, RouteFilterInput } from '../types/generated/schema-types'
import { cacheFetch } from './cache'
import { filterRoutes } from './filters/filterRoutes'
import { CachedFetcher } from '../types/CachedFetcher'
import { getDirection } from '../utils/getDirection'
import pMap from 'p-map'

export async function createRoutesResponse(
  getRoutes: () => Promise<JoreRoute[]>,
  getCancellations,
  getAlerts,
  date: string,
  line?: string,
  filter?: RouteFilterInput
): Promise<Route[]> {
  const fetchAndValidate: CachedFetcher<JoreRoute[]> = async () => {
    const routes = await getRoutes()

    if (!routes) {
      return false
    }

    const groupedRoutes = groupBy(routes, ({ route_id, direction }) => `${route_id}.${direction}`)
    return filterByDateChains<JoreRoute>(groupedRoutes, date)
  }

  const cacheKey = !date ? false : `routes_${date}`
  const validRoutes = await cacheFetch<JoreRoute[]>(cacheKey, fetchAndValidate, 24 * 60 * 60)

  if (!validRoutes) {
    return []
  }

  const filteredRoutes = filterRoutes(validRoutes, line, filter)

  return pMap(filteredRoutes, async (route) => {
    const routeAlerts = await getAlerts(date, { allRoutes: true, route: route.route_id })

    const routeCancellations = await getCancellations(date, {
      routeId: route.route_id,
      direction: getDirection(route.direction) || undefined,
    })

    return createRouteObject(route, routeAlerts, routeCancellations)
  })
}
