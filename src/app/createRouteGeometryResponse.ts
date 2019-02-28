import { get } from 'lodash'
import { filterByDateChains } from '../utils/filterByDateChains'
import { Route as JoreRoute } from '../types/generated/jore-types'
import { cacheFetch } from './cache'
import { Direction, RouteGeometry } from '../types/generated/schema-types'

export async function createRouteGeometryResponse(
  getRouteGeometry: () => Promise<JoreRoute[]>,
  date: string,
  routeId: string,
  direction: Direction
): Promise<RouteGeometry[] | null> {
  const fetchAndValidate = async () => {
    const routes = await getRouteGeometry()
    const validRoutes = filterByDateChains<JoreRoute>({ routes }, date)
    const selectedRoute = validRoutes[0]

    if (!selectedRoute) {
      return false
    }

    const geometries = get(validRoutes, '[0].geometries.nodes', [])

    const geometry = geometries.find(
      ({ dateBegin: geomDateBegin, dateEnd: geomDateEnd }) =>
        geomDateBegin === selectedRoute.dateBegin && geomDateEnd === selectedRoute.dateEnd
    )

    // Convert to lat/lng points
    const coordinates = get(geometry, 'geometry.coordinates', []).map(([lon, lat]) => ({
      lat,
      lng: lon,
    }))

    return { coordinates }
  }

  const cacheKey = `routeGeometry_${routeId}_${direction}_${date}`
  const validRouteGeometry = await cacheFetch<RouteGeometry>(cacheKey, fetchAndValidate)

  if (!validRouteGeometry) {
    return null
  }

  return validRouteGeometry
}
