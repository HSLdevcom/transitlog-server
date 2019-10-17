import { get } from 'lodash'
import { Route, RouteFilterInput } from '../../types/generated/schema-types'
import { search } from './search'
import { getDirection } from '../../utils/getDirection'

export function filterRoutes(routes: Route[], line?: string, filter?: RouteFilterInput) {
  if (line) {
    return routes.filter((route) => get(route, 'lineId', '') === line)
  }

  const routeIdFilter = get(filter, 'routeId', '')
  const directionFilter = getDirection(get(filter, 'direction', ''))

  if (routeIdFilter && directionFilter) {
    return routes.filter(
      (route) => route.routeId === routeIdFilter && route.direction === directionFilter
    )
  }

  let searchFilter =
    routeIdFilter || directionFilter
      ? `${routeIdFilter},${directionFilter}`
      : get(filter, 'search', '')

  searchFilter = (searchFilter || '').trim()

  if (!searchFilter) {
    return routes
  }

  return search<Route>(routes, searchFilter, ['routeId', 'direction', 'name'])
}
