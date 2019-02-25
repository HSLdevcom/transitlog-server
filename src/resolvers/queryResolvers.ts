import { QueryResolvers } from '../types/generated/resolver-types'
import { createLinesResponse } from '../app/lines/createLinesResponse'

const equipment = (root, args, { app }) => app.equipment
const stops = (root, args, { app }) => app.stops
const routes = (root, args, { app }) => app.routes
const routeGeometry = (root, args, { app }) => app.routeGeometry

const lines = async (
  root,
  { filter, date, includeDatesWithoutRoutes },
  { app, dataSources }
) => {
  const lines = await dataSources.JoreAPI.getAllLines()
  return createLinesResponse(lines, date)
}

const departures = (root, args, { app }) => app.departures
const journey = (root, args, { app }) => app.departures

export const queryResolvers: QueryResolvers.Resolvers = {
  equipment,
  stops,
  routes,
  routeGeometry,
  lines,
  departures,
  journey,
}
