import { groupBy } from 'lodash'
import { filterByDateChains } from '../utils/filterByDateChains'
import { createRouteObject } from '../objects/createRouteObject'
import { JoreRoute, JoreLine } from '../types/Jore'
import { Route, RouteFilterInput, Scalars } from '../types/generated/schema-types'
import { cacheFetch } from '../cache'
import { filterRoutes } from '../filters/filterRoutes'
import { CachedFetcher } from '../types/CachedFetcher'
import { getDirection } from '../utils/getDirection'
import { requireUser } from '../auth/requireUser'
import { filterByDateGroups } from '../utils/filterByDateGroups'

interface FilteredRouteSet {
  [details: string]: JoreRoute
}

export async function createRouteResponse(
  getRoute: () => Promise<JoreRoute[]>,
  getLine: () => Promise<JoreLine[]>,
  getCancellations,
  date: string,
  routeId: string,
  direction: Scalars['Direction'],
  skipCache = false
): Promise<Route | null> {
  const fetchAndValidate: CachedFetcher<JoreRoute> = async () => {
    const routes = await getRoute()
    const lines = await getLine()
    let validLine: JoreLine | null = null
    if (lines) {
      const validLines = filterByDateGroups<JoreLine>(lines, date)
      if (validLines.length > 0) {
        validLine = validLines[0]
      }
    }

    if (!routes) {
      return false
    }

    const validRoute = filterByDateGroups<JoreRoute>(routes, date)
    const selectedValidRoute = validRoute[0]

    if (validLine && selectedValidRoute) {
      const validLineTrunkroute = validLine.trunk_route
      selectedValidRoute.trunk_route = validLineTrunkroute
    }
    return selectedValidRoute
  }

  const cacheKey = `route_${routeId}_${direction}_${date}`
  const validRoute = await cacheFetch<JoreRoute>(
    cacheKey,
    fetchAndValidate,
    30 * 24 * 60 * 60,
    skipCache
  )

  if (!validRoute) {
    return null
  }

  const routeCancellations = await getCancellations(
    date,
    {
      routeId: validRoute.route_id,
      direction: getDirection(validRoute.direction) || undefined,
    },
    skipCache
  )

  return createRouteObject(validRoute, routeCancellations)
}

export async function createRoutesResponse(
  user,
  getRoutes: () => Promise<JoreRoute[]>,
  getLines: () => Promise<JoreLine[]>,
  getCancellations,
  date: string,
  filter?: RouteFilterInput,
  skipCache = false
): Promise<Route[]> {
  const fetchAndValidate: CachedFetcher<Route[]> = async () => {
    const routes = await getRoutes()
    const lines = await getLines()

    if (!routes) {
      return false
    }

    const groupedLines = groupBy(lines, ({ line_id, name_fi }) => `${line_id}.${name_fi}`)
    const filteredLinesByDateChains = filterByDateChains<JoreLine>(groupedLines, date)
    const linesById = new Map<string, JoreLine[]>()

    for (const line of filteredLinesByDateChains) {
      const existing = linesById.get(line.line_id)
      if (existing) {
        existing.push(line)
      } else {
        linesById.set(line.line_id, [line])
      }
    }
    const cancellations = await getCancellations(date, { all: true }, skipCache)

    const groupedRoutes = groupBy(routes, ({ route_id, name_fi }) => `${route_id}.${name_fi}`)

    const filteredRoutesByDateChains = filterByDateChains<JoreRoute>(groupedRoutes, date)

    const filteredRouteSet: FilteredRouteSet = {}

    filteredRoutesByDateChains.forEach((route) => {
      const routeKey = `${route.direction}.${route.route_id}`
      const existingRoute = filteredRouteSet[routeKey]

      if (!existingRoute) {
        const validLines = linesById.get(route.route_id)

        if (validLines) {
          const mostValidLine = filterByDateGroups<JoreLine>(validLines, date)[0]
          route.trunk_route = mostValidLine.trunk_route
        }

        filteredRouteSet[routeKey] = route
      }
    })

    const filteredRoutes = Object.values(filteredRouteSet)

    return filteredRoutes.map((route) => {
      const routeCancellations = cancellations.filter(
        (cancellation) =>
          cancellation.routeId === route.route_id &&
          cancellation.direction === getDirection(route.direction)
      )

      return createRouteObject(route, routeCancellations)
    })
  }

  const cacheKey = `routes_${date}_${
    requireUser(user, 'HSL') ? 'HSL_authorized' : 'unauthorized'
  }`

  const validRoutes = await cacheFetch<Route[]>(
    cacheKey,
    fetchAndValidate,
    24 * 60 * 60,
    skipCache
  )

  if (!validRoutes) {
    return []
  }

  return filterRoutes(validRoutes, filter)
}
