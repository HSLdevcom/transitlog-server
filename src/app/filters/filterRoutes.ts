import { Route as JoreRoute } from '../../types/generated/jore-types'
import { get } from 'lodash'
import { RouteFilterInput } from '../../types/generated/schema-types'
import { search } from './search'
import { getDirection } from '../../utils/getDirection'

export function filterRoutes(routes: JoreRoute[], line?: string, filter?: RouteFilterInput) {
  if (line) {
    return routes.filter((route) => get(route, 'line.nodes[0].lineId', '') === line)
  }

  const routeIdFilter = get(filter, 'routeId', '')
  const directionFilter = getDirection(get(filter, 'direction', ''))

  if (routeIdFilter && directionFilter) {
    return routes.filter(
      (route) =>
        route.routeId === routeIdFilter && getDirection(route.direction) === directionFilter
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

  const getSearchTermsForItem = ({
    routeId,
    direction,
    nameFi,
    originstopId,
    destinationstopId,
  }: JoreRoute) => [routeId, direction, nameFi, originstopId, destinationstopId]

  return search<JoreRoute>(routes, searchFilter, getSearchTermsForItem)
}
