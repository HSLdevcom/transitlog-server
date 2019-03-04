import { QueryResolvers } from '../types/generated/resolver-types'
import { createLinesResponse } from '../app/createLinesResponse'
import { createRoutesResponse } from '../app/createRoutesResponse'
import { createStopsResponse } from '../app/createStopsResponse'
import { createRouteGeometryResponse } from '../app/createRouteGeometryResponse'
import { createEquipmentResponse } from '../app/createEquipmentResponse'
import { createJourneyResponse } from '../app/createJourneyResponse'
import { filterByDateChains } from '../utils/filterByDateChains'
import { Route as JoreRoute } from '../types/generated/jore-types'

const equipment = (root, { filter, date }, { dataSources }) => {
  const getEquipment = () => dataSources.JoreAPI.getEquipment()
  const getObservedVehicles = () => dataSources.HFPAPI.getAvailableVehicles(date)
  return createEquipmentResponse(getEquipment, getObservedVehicles, filter, date)
}

const stops = (root, { filter }, { dataSources }) => {
  const getStops = () => dataSources.JoreAPI.getStops()
  return createStopsResponse(getStops, filter)
}

const routes = async (root, { filter, date }, { dataSources }) => {
  const getRoutes = () => dataSources.JoreAPI.getRoutes()
  return createRoutesResponse(getRoutes, date, filter)
}

const routeGeometry = (root, { date, routeId, direction }, { dataSources }) => {
  const getRouteGeometry = () => dataSources.JoreAPI.getRouteGeometry(routeId, direction)
  return createRouteGeometryResponse(getRouteGeometry, date, routeId, direction)
}

const lines = async (root, { filter, date }, { dataSources }) => {
  const getLines = () => dataSources.JoreAPI.getLines()
  return createLinesResponse(getLines, date, filter)
}

const departures = (root, args, { app }) => []

const journey = (
  root,
  { routeId, direction, departureTime, departureDate, instance },
  { dataSources }
) => {
  const getJourneyRoute = async () => {
    const availableRoutes = await dataSources.JoreAPI.getRouteIndex(routeId, direction)

    if (!availableRoutes || availableRoutes.length === 0) {
      return null
    }

    const validRoutes = filterByDateChains<JoreRoute>([availableRoutes], departureDate)

    if (validRoutes.length === 0) {
      return null
    }

    const route = validRoutes[0]
    return dataSources.JoreAPI.getJourneyRoute(
      route.routeId,
      route.direction,
      route.dateBegin,
      route.dateEnd,
      departureDate
    )
  }

  const getJourneyEvents = () =>
    dataSources.HFPAPI.getJourneyEvents(routeId, direction, departureDate, departureTime)

  return createJourneyResponse(
    getJourneyRoute,
    getJourneyEvents,
    routeId,
    direction,
    departureDate,
    departureTime,
    instance
  )
}

export const queryResolvers: QueryResolvers.Resolvers = {
  equipment,
  stops,
  routes,
  routeGeometry,
  lines,
  departures,
  journey,
}
