import { get } from 'lodash'
import { filterByDateChains } from '../utils/filterByDateChains'
import { JoreRoute } from '../types/Jore'
import { cacheFetch } from './cache'
import { Direction, RouteGeometry } from '../types/generated/schema-types'
import { CachedFetcher } from '../types/CachedFetcher'

export async function createRouteGeometryResponse(
  getRouteGeometry: () => Promise<JoreRoute[]>,
  date: string,
  routeId: string,
  direction: Direction
): Promise<RouteGeometry | null> {
  const fetchAndValidate: CachedFetcher<RouteGeometry> = async () => {
    const routes = await getRouteGeometry()
    const validRoutes = filterByDateChains<JoreRoute>({ routes }, date)
    const selectedRoute = validRoutes ? validRoutes[0] : null

    if (!selectedRoute) {
      return false
    }

    const geometry = get(selectedRoute, 'geometry.coordinates', [])

    // Convert to lat/lng points
    const coordinates = geometry.map(([lon, lat]) => ({
      lat,
      lng: lon,
    }))

    return {
      id: `route_geometry_${routeId}_${direction}_${selectedRoute.date_begin}_${
        selectedRoute.date_end
      }`,
      mode: selectedRoute.mode,
      coordinates,
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
