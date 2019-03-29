import { groupBy } from 'lodash'
import { filterByDateChains } from '../utils/filterByDateChains'
import { createRouteObject } from './objects/createRouteObject'
import { Route as JoreRoute } from '../types/generated/jore-types'
import { Direction, Route, RouteFilterInput } from '../types/generated/schema-types'
import { cacheFetch } from './cache'
import { filterRoutes } from './filters/filterRoutes'
import { CachedFetcher } from '../types/CachedFetcher'

export async function createRouteResponse(
  getRoute: () => Promise<JoreRoute[] | null>,
  date: string,
  routeId: string,
  direction: Direction
): Promise<Route | null> {
  const fetchAndValidate: CachedFetcher<JoreRoute> = async () => {
    const routes = await getRoute()

    if (!routes) {
      return false
    }

    return filterByDateChains<JoreRoute>([routes], date)[0]
  }

  const cacheKey = `route_${routeId}_${direction}_${date}`
  const validRoute = await cacheFetch<JoreRoute>(cacheKey, fetchAndValidate, 24 * 60 * 60)

  if (!validRoute) {
    return null
  }

  return createRouteObject(validRoute)
}

export async function createRoutesResponse(
  getRoutes: () => Promise<JoreRoute[]>,
  date?: string,
  line?: string,
  filter?: RouteFilterInput
): Promise<Route[]> {
  const fetchAndValidate = async () => {
    const routes = await getRoutes()

    if (!routes) {
      return false
    }

    const groupedRoutes = groupBy(routes, ({ routeId, direction }) => `${routeId}.${direction}`)

    return filterByDateChains<JoreRoute>(groupedRoutes, date)
  }

  const cacheKey = !date ? false : `routes_${date}`
  const validRoutes = await cacheFetch<JoreRoute[]>(cacheKey, fetchAndValidate)

  if (!validRoutes) {
    return []
  }

  const filteredRoutes = filterRoutes(validRoutes, line, filter)
  return filteredRoutes.map(createRouteObject)
}
