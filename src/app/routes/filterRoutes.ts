import { Route as JoreRoute } from '../../types/generated/jore-types'
import { get } from 'lodash'
import { RouteFilterInput } from '../../types/generated/schema-types'

export function filterRoutes(routes: JoreRoute[], filter?: RouteFilterInput) {
  const routeIdFilter = get(filter, 'routeId', '')
  const directionFilter = get(filter, 'direction', '')

  if (!routeIdFilter && !directionFilter) {
    return routes
  }

  return routes.filter((routeItem: JoreRoute) => {
    if (!routeIdFilter) {
      return true
    }

    const dir = routeItem.direction === '1' ? 'D1' : 'D2'
    const matchesDir = directionFilter ? dir === directionFilter : !routeIdFilter
    const matchesRouteId = routeItem.routeId.includes(routeIdFilter)

    return matchesRouteId || matchesDir
  })
}
