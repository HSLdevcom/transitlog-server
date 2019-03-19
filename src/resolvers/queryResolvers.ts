import { QueryResolvers } from '../types/generated/resolver-types'
import { createLinesResponse } from '../app/createLinesResponse'
import { createRoutesResponse } from '../app/createRoutesResponse'
import { createStopsResponse } from '../app/createStopsResponse'
import { createRouteGeometryResponse } from '../app/createRouteGeometryResponse'
import { createEquipmentResponse } from '../app/createEquipmentResponse'
import { createJourneyResponse } from '../app/createJourneyResponse'
import { createDeparturesResponse } from '../app/createDepartureResponse'
import { getNormalTime } from '../utils/time'

const equipment = (root, { filter, date }, { dataSources }) => {
  const getEquipment = () => dataSources.JoreAPI.getEquipment()
  const getObservedVehicles = () => dataSources.HFPAPI.getAvailableVehicles(date)
  return createEquipmentResponse(getEquipment, getObservedVehicles, filter, date)
}

const stops = (root, { filter, date }, { dataSources }) => {
  const getStops = () => dataSources.JoreAPI.getStops()
  return createStopsResponse(getStops, date, filter)
}

const routes = async (root, { filter, line, date }, { dataSources }) => {
  const getRoutes = () => dataSources.JoreAPI.getRoutes()
  return createRoutesResponse(getRoutes, date, line, filter)
}

const routeGeometry = (root, { date, routeId, direction }, { dataSources }) => {
  const getRouteGeometry = () => dataSources.JoreAPI.getRouteGeometry(routeId, direction)
  return createRouteGeometryResponse(getRouteGeometry, date, routeId, direction)
}

const lines = async (root, { filter, date }, { dataSources }) => {
  const getLines = () => dataSources.JoreAPI.getLines()
  return createLinesResponse(getLines, date, filter)
}

const departures = (root, { filter, stopId, date }, { dataSources }) => {
  const getDepartures = () => dataSources.JoreAPI.getDepartures(stopId, date)
  const getStop = () => dataSources.JoreAPI.getDepartureStop(stopId)
  const getDepartureEvents = () => dataSources.HFPAPI.getDepartureEvents(stopId, date)

  return createDeparturesResponse(getDepartures, getStop, getDepartureEvents, stopId, date, filter)
}

const journey = (
  root,
  { routeId, direction, departureTime, departureDate, instance },
  { dataSources }
) => {
  const getRouteData = () => dataSources.JoreAPI.getFullRoute(routeId, direction, departureDate)

  const getJourneyEvents = () =>
    dataSources.HFPAPI.getJourneyEvents(
      routeId,
      direction,
      departureDate,
      getNormalTime(departureTime)
    )

  const getJourneyEquipment = (vehicleId, operatorId) =>
    dataSources.JoreAPI.getEquipmentById(vehicleId, operatorId)

  return createJourneyResponse(
    getRouteData,
    getJourneyEvents,
    getJourneyEquipment,
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
