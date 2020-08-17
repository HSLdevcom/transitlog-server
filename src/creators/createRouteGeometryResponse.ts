import { JoreRouteGeometry } from '../types/Jore'
import { cacheFetch } from '../cache'
import { RouteGeometry, Scalars } from '../types/generated/schema-types'
import { CachedFetcher } from '../types/CachedFetcher'
import { filterByDateGroups } from '../utils/filterByDateGroups'
import { orderBy } from 'lodash'

export async function createRouteGeometryResponse(
  getRouteGeometry: () => Promise<JoreRouteGeometry[]>,
  date: string,
  routeId: string,
  direction: Scalars['Direction']
): Promise<RouteGeometry | null> {
  const fetchAndValidate: CachedFetcher<RouteGeometry> = async () => {
    const routes = await getRouteGeometry()
    const selectedRoute = routes.length === 0 ? null : orderBy(routes, 'date_begin', 'desc')[0]

    if (!selectedRoute) {
      return false
    }

    return {
      id: `route_geometry_${routeId}_${direction}_${selectedRoute.date_begin}`,
      mode: selectedRoute.mode,
      geometry: JSON.stringify(selectedRoute.geometry),
    }
  }

  const cacheKey = `routeGeometry_${routeId}_${direction}_${date}`
  const validRouteGeometry = await cacheFetch<RouteGeometry>(
    cacheKey,
    fetchAndValidate,
    24 * 60 * 60
  )

  if (!validRouteGeometry) {
    return null
  }

  return validRouteGeometry
}
