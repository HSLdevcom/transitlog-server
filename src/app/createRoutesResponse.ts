import { groupBy } from 'lodash'
import { filterByDateChains } from '../utils/filterByDateChains'
import { createRouteObject } from './objects/createRouteObject'
import { Route as JoreRoute } from '../types/generated/jore-types'
import { Route, RouteFilterInput } from '../types/generated/schema-types'
import { cacheFetch } from './cache'
import { filterRoutes } from './filters/filterRoutes'

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
