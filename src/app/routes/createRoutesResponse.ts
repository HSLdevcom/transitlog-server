import { groupBy } from 'lodash'
import { filterByDateChains } from '../../utils/filterByDateChains'
import { createRouteObject } from './createRouteObject'
import { Route as JoreRoute } from '../../types/generated/jore-types'
import { Route, RouteFilterInput } from '../../types/generated/schema-types'
import { cacheFetch } from '../cache'
import { filterRoutes } from './filterRoutes'

export async function createRoutesResponse(
  getRoutes: () => Promise<JoreRoute[]>,
  date?: string,
  filter?: RouteFilterInput
): Promise<Route[]> {
  const fetchAndValidate = async () => {
    const routes = await getRoutes()

    const groupedRoutes = groupBy(
      routes,
      ({ routeId, direction }) => `${routeId}.${direction}`
    )

    return filterByDateChains<JoreRoute>(groupedRoutes, date)
  }

  const cacheKey = !date ? false : `routes_${date}`
  const validRoutes: JoreRoute[] = await cacheFetch<JoreRoute>(cacheKey, fetchAndValidate)

  const filteredRoutes = filterRoutes(validRoutes, filter)
  return filteredRoutes.map(createRouteObject)
}
