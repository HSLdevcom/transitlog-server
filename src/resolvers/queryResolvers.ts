import { QueryResolvers } from '../types/generated/resolver-types'
import { createLinesResponse } from '../app/createLinesResponse'
import { createRoutesResponse } from '../app/createRoutesResponse'
import { createStopResponse, createStopsResponse } from '../app/createStopsResponse'
import { createRouteGeometryResponse } from '../app/createRouteGeometryResponse'
import { createEquipmentResponse } from '../app/createEquipmentResponse'
import { createJourneyResponse } from '../app/createJourneyResponse'
import { createDeparturesResponse } from '../app/createDepartureResponse'
import { createRouteSegmentsResponse } from '../app/createRouteSegmentsResponse'
import { createVehicleJourneysResponse } from '../app/createVehicleJourneysResponse'
import { createAreaJourneysResponse } from '../app/createAreaJourneysResponse'
import { getExceptions } from '../utils/getExceptions'

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
  const getStopSegments = () => dataSources.JoreAPI.getStopSegments(stopId, date)
  return createStopResponse(getStopSegments, date, stopId)
}

const route = async (root, { routeId, direction, date }, { dataSources }) => {
  const getRoutes = () => dataSources.JoreAPI.getRoutes()
  const routes = await createRoutesResponse(getRoutes, date, undefined, { routeId, direction })
  return routes[0]
}

const routes = async (root, { filter, line, date }, { dataSources }) => {
  const getRoutes = () => dataSources.JoreAPI.getRoutes()
  return createRoutesResponse(getRoutes, date, line, filter)
}

const routeGeometry = (root, { date, routeId, direction }, { dataSources }) => {
  const getRouteGeometry = () => dataSources.JoreAPI.getRouteGeometry(routeId, direction, date)
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
    dataSources.JoreAPI.getEquipmentById(vehicleId, operatorId)

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

const eventsByBbox = (root, { minTime, maxTime, bbox, date, filters }, { dataSources }) => {
  const getAreaJourneys = () => dataSources.HFPAPI.getAreaJourneys(minTime, maxTime, bbox, date)
  return createAreaJourneysResponse(getAreaJourneys, minTime, maxTime, bbox, date, filters)
}

const exceptionDays = (root, { year }) => {
  return getExceptions(year)
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
  eventsByBbox,
  exceptionDays,
}
