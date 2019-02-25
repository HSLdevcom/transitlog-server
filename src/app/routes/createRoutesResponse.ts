import { groupBy } from 'lodash'
import { filterByDateChains } from '../../utils/filterByDateChains'
import { createRouteObject } from './createRouteObject'
import { Route as JoreRoute } from '../../types/generated/jore-types'
import { Route, RouteFilterInput } from '../../types/generated/schema-types'
import { getItem, hasItem, setItem } from '../cache'
import { filterRoutes } from './filterRoutes'

export async function createRoutesResponse(
  routes: JoreRoute[],
  date?: string,
  filter?: RouteFilterInput
): Promise<Route[]> {
  const cacheKey = `routes_${date}`
  let validRoutes: JoreRoute[] = []

  if (date && (await hasItem(cacheKey))) {
    validRoutes = (await getItem<JoreRoute>(cacheKey)) || []
  }

  if (validRoutes.length === 0) {
    const groupedRoutes = groupBy(routes, 'routeId')
    validRoutes = filterByDateChains<JoreRoute>(groupedRoutes, date)

    if (date) {
      await setItem(cacheKey, validRoutes)
    }
  }

  const filteredRoutes = filterRoutes(validRoutes, filter)
  return filteredRoutes.map(createRouteObject)
}
