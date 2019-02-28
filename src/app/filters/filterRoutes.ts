import { Route as JoreRoute } from '../../types/generated/jore-types'
import { get } from 'lodash'
import { RouteFilterInput } from '../../types/generated/schema-types'
import { search } from './search'

export function filterRoutes(routes: JoreRoute[], filter?: RouteFilterInput) {
  const routeIdFilter = get(filter, 'routeId', '')
  const directionFilter = get(filter, 'direction', '')

  let searchFilter =
    routeIdFilter || directionFilter
      ? `${routeIdFilter} ${directionFilter}`
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
