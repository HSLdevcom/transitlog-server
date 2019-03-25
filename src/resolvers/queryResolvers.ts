import { QueryResolvers } from '../types/generated/resolver-types'
import { createLinesResponse } from '../app/createLinesResponse'
import { createRouteResponse, createRoutesResponse } from '../app/createRoutesResponse'
import { createStopResponse, createStopsResponse } from '../app/createStopsResponse'
import { createRouteGeometryResponse } from '../app/createRouteGeometryResponse'
import { createEquipmentResponse } from '../app/createEquipmentResponse'
import { createJourneyResponse } from '../app/createJourneyResponse'
import { createDeparturesResponse } from '../app/createDepartureResponse'
import { getNormalTime } from '../utils/time'
import { createRouteSegmentsResponse } from '../app/createRouteSegmentsResponse'
import { createVehicleJourneysResponse } from '../app/createVehicleJourneysResponse'

const equipment = (root, { filter, date }, { dataSources }) => {
  const getEquipment = () => dataSources.JoreAPI.getEquipment()
  const getObservedVehicles = () => dataSources.HFPAPI.getAvailableVehicles(date)
  return createEquipmentResponse(getEquipment, getObservedVehicles, filter, date)
}

const stops = (root, { filter }, { dataSources }) => {
  const getStops = () => dataSources.JoreAPI.getStops()
  return createStopsResponse(getStops, filter)
}

const stopsByBbox = (root, { filter, bbox }, { dataSources }) => {
  const getStops = () => dataSources.JoreAPI.getStopsByBBox(bbox)
  return createStopsResponse(getStops, filter, bbox)
}

const stop = (root, { stopId, date }, { dataSources }) => {
  const getStop = () => dataSources.JoreAPI.getStop(stopId)
  return createStopResponse(getStop, date, stopId)
}

const route = async (root, { routeId, direction, date }, { dataSources }) => {
  const getRoute = () => dataSources.JoreAPI.getRoute(routeId, direction)
  return createRouteResponse(getRoute, date, routeId, direction)
}

const routes = async (root, { filter, line, date }, { dataSources }) => {
  const getRoutes = () => dataSources.JoreAPI.getRoutes()
  return createRoutesResponse(getRoutes, date, line, filter)
}

const routeGeometry = (root, { date, routeId, direction }, { dataSources }) => {
  const getRouteGeometry = () => dataSources.JoreAPI.getRouteGeometry(routeId, direction)
  return createRouteGeometryResponse(getRouteGeometry, date, routeId, direction)
}

const routeSegments = (root, { routeId, direction, date }, { dataSources }) => {
  const getRouteSegments = () => dataSources.JoreAPI.getRouteSegments(routeId, direction)
  return createRouteSegmentsResponse(getRouteSegments, date, routeId, direction)
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
  { routeId, direction, departureTime, departureDate, uniqueVehicleId },
  { dataSources }
) => {
  const getRouteData = () => dataSources.JoreAPI.getFullRoute(routeId, direction, departureDate)

  const getJourneyEvents = () =>
    dataSources.HFPAPI.getJourneyEvents(
      routeId,
      direction,
      departureDate,
      departureTime,
      uniqueVehicleId
    )

  const getJourneyEquipment = (vehicleId, operatorId) =>
    dataSources.JoreAPI.getEquipmentById(uniqueVehicleId, operatorId)

  return createJourneyResponse(
    getRouteData,
    getJourneyEvents,
    getJourneyEquipment,
    routeId,
    direction,
    departureDate,
    departureTime,
    uniqueVehicleId
  )
}

const vehicleJourneys = (root, { uniqueVehicleId, date }, { dataSources }) => {
  const getVehicleJourneys = () => dataSources.HFPAPI.getJourneysForVehicle(uniqueVehicleId, date)
  return createVehicleJourneysResponse(getVehicleJourneys, uniqueVehicleId, date)
}

export const queryResolvers: QueryResolvers.Resolvers = {
  equipment,
  stop,
  stops,
  stopsByBbox,
  route,
  routes,
  routeGeometry,
  routeSegments,
  lines,
  departures,
  journey,
  vehicleJourneys,
}
