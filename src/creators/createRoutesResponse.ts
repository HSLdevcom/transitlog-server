import { groupBy } from 'lodash'
import { filterByDateChains } from '../utils/filterByDateChains'
import { createRouteObject } from '../objects/createRouteObject'
import { JoreRoute } from '../types/Jore'
import { Route, RouteFilterInput, Scalars } from '../types/generated/schema-types'
import { cacheFetch } from '../cache'
import { filterRoutes } from '../filters/filterRoutes'
import { CachedFetcher } from '../types/CachedFetcher'
import { getDirection } from '../utils/getDirection'
import { requireUser } from '../auth/requireUser'
import { filterByDateGroups } from '../utils/filterByDateGroups'

export async function createRouteResponse(
  getRoute: () => Promise<JoreRoute[]>,
  getCancellations,
  date: string,
  routeId: string,
  direction: Scalars['Direction'],
  skipCache = false
): Promise<Route | null> {
  const fetchAndValidate: CachedFetcher<JoreRoute> = async () => {
    const routes = await getRoute()

    if (!routes) {
      return false
    }

    const validRoute = filterByDateGroups<JoreRoute>(routes, date)
    return validRoute[0]
  }

  const cacheKey = `route_${routeId}_${direction}_${date}`
  const validRoute = await cacheFetch<JoreRoute>(
    cacheKey,
    fetchAndValidate,
    30 * 24 * 60 * 60,
    skipCache
  )

  if (!validRoute) {
    return null
  }

  const routeCancellations = await getCancellations(
    date,
    {
      routeId: validRoute.route_id,
      direction: getDirection(validRoute.direction) || undefined,
    },
    skipCache
  )

  return createRouteObject(validRoute, routeCancellations)
}

export async function createRoutesResponse(
  user,
  getRoutes: () => Promise<JoreRoute[]>,
  getCancellations,
  date: string,
  filter?: RouteFilterInput,
  skipCache = false
): Promise<Route[]> {
  const fetchAndValidate: CachedFetcher<Route[]> = async () => {
    const routes = await getRoutes()

    if (!routes) {
      return false
    }

    const cancellations = await getCancellations(date, { all: true }, skipCache)

    const groupedRoutes = groupBy(
      routes,
      ({ route_id, direction }) => `${route_id}.${direction}`
    )
    const filteredRoutes = filterByDateChains<JoreRoute>(groupedRoutes, date)

    return filteredRoutes.map((route) => {
      const routeCancellations = cancellations.filter(
        (cancellation) =>
          cancellation.routeId === route.route_id &&
          cancellation.direction === getDirection(route.direction)
      )

      return createRouteObject(route, routeCancellations)
    })
  }

  const cacheKey = `routes_${date}_${
    requireUser(user, 'HSL') ? 'HSL_authorized' : 'unauthorized'
  }`

  const validRoutes = await cacheFetch<Route[]>(
    cacheKey,
    fetchAndValidate,
    24 * 60 * 60,
    skipCache
  )

  if (!validRoutes) {
    return []
  }

  return filterRoutes(validRoutes, filter)
}
