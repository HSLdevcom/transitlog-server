import { JoreRoute } from '../../types/Jore'
import { get } from 'lodash'
import { RouteFilterInput } from '../../types/generated/schema-types'
import { search } from './search'
import { getDirection } from '../../utils/getDirection'

export function filterRoutes(routes: JoreRoute[], line?: string, filter?: RouteFilterInput) {
  if (line) {
    return routes.filter((route) => get(route, 'line.nodes[0].line_id', '') === line)
  }

  const routeIdFilter = get(filter, 'route_id', '')
  const directionFilter = getDirection(get(filter, 'direction', ''))

  if (routeIdFilter && directionFilter) {
    return routes.filter(
      (route) =>
        route.route_id === routeIdFilter && getDirection(route.direction) === directionFilter
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
    route_id,
    direction,
    name_fi,
    originstop_id,
    destinationstop_id,
  }: JoreRoute) => [route_id, direction, name_fi, originstop_id, destinationstop_id]

  return search<JoreRoute>(routes, searchFilter, getSearchTermsForItem)
}
