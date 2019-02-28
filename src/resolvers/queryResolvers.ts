import { QueryResolvers } from '../types/generated/resolver-types'
import { createLinesResponse } from '../app/createLinesResponse'
import { createRoutesResponse } from '../app/createRoutesResponse'
import { createStopsResponse } from '../app/createStopsResponse'
import { createRouteGeometryResponse } from '../app/createRouteGeometryResponse'

const equipment = (root, args, { app }) => []

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
const journey = (root, args, { app }) => []

export const queryResolvers: QueryResolvers.Resolvers = {
  equipment,
  stops,
  routes,
  routeGeometry,
  lines,
  departures,
  journey,
}
