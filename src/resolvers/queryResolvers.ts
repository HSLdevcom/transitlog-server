import { QueryResolvers } from '../types/generated/resolver-types'
import { createLinesResponse } from '../app/createLinesResponse'
import { createRoutesResponse } from '../app/createRoutesResponse'
import { createStopResponse, createStopsResponse } from '../app/createStopsResponse'
import { createRouteGeometryResponse } from '../app/createRouteGeometryResponse'
import { createEquipmentResponse } from '../app/createEquipmentResponse'
import { createJourneyResponse } from '../app/createJourneyResponse'
import { createDeparturesResponse } from '../app/createDeparturesResponse'
import { createRouteSegmentsResponse } from '../app/createRouteSegmentsResponse'
import { createVehicleJourneysResponse } from '../app/createVehicleJourneysResponse'
import { createAreaJourneysResponse } from '../app/createAreaJourneysResponse'
import { createRouteJourneysResponse } from '../app/createRouteJourneysResponse'
import { createWeekDeparturesResponse } from '../app/createWeekDeparturesResponse'
import { createRouteDeparturesResponse } from '../app/createRouteDeparturesResponse'
import { format } from 'date-fns'
import { compact, flatten } from 'lodash'
import { getWeekDates } from '../utils/getWeekDates'
import { Alert, AlertDistribution, AlertLevel } from '../types/generated/schema-types'

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

const departures = async (root, { filter, stopId, date }, { dataSources }) => {
  const exceptions = await dataSources.JoreAPI.getExceptions(date)
  const getDepartures = () => dataSources.JoreAPI.getDeparturesForStop(stopId, date)
  const getStops = () => dataSources.JoreAPI.getDepartureStops(stopId, date)
  const getDepartureEvents = () => dataSources.HFPAPI.getDepartureEvents(stopId, date)

  return createDeparturesResponse(
    getDepartures,
    getStops,
    getDepartureEvents,
    exceptions,
    stopId,
    date,
    filter
  )
}

const routeDepartures = async (root, { routeId, direction, stopId, date }, { dataSources }) => {
  const exceptions = await dataSources.JoreAPI.getExceptions(date)

  const getDepartures = () =>
    dataSources.JoreAPI.getDeparturesForRoute(stopId, routeId, direction, date)
  const getStops = () => dataSources.JoreAPI.getDepartureStops(stopId, date)
  const getDepartureEvents = () =>
    dataSources.HFPAPI.getRouteDepartureEvents(stopId, date, routeId, direction)

  return createRouteDeparturesResponse(
    getDepartures,
    getStops,
    getDepartureEvents,
    exceptions,
    stopId,
    routeId,
    direction,
    date
  )
}

const weeklyDepartures = async (root, { routeId, direction, stopId, date }, { dataSources }) => {
  const weekDates = getWeekDates(date)

  const exceptionPromises = weekDates.map((date) =>
    dataSources.JoreAPI.getExceptions(format(date, 'YYYY-MM-DD'))
  )

  let exceptionsForWeek = await Promise.all(exceptionPromises)
  exceptionsForWeek = flatten(exceptionsForWeek)

  const exceptionDayTypes = compact(
    flatten(exceptionsForWeek.map(({ effectiveDayTypes }) => effectiveDayTypes))
  )

  const getDepartures = () =>
    dataSources.JoreAPI.getWeeklyDepartures(stopId, routeId, direction, exceptionDayTypes)

  const getStops = () => dataSources.JoreAPI.getDepartureStops(stopId, date)
  const getDepartureEvents = () =>
    dataSources.HFPAPI.getWeeklyDepartureEvents(stopId, date, routeId, direction)

  return createWeekDeparturesResponse(
    getDepartures,
    getStops,
    getDepartureEvents,
    exceptionsForWeek,
    stopId,
    routeId,
    direction,
    date
  )
}

const journey = async (
  root,
  { routeId, direction, departureTime, departureDate, uniqueVehicleId },
  { dataSources, user }
) => {
  const exceptions = await dataSources.JoreAPI.getExceptions(departureDate)
  const getRouteData = () => dataSources.JoreAPI.getDepartureData(routeId, direction, departureDate)

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
    exceptions,
    routeId,
    direction,
    departureDate,
    departureTime,
    uniqueVehicleId,
    user
  )
}

const journeys = (root, { routeId, direction, departureDate }, { dataSources }) => {
  const getJourney = () => dataSources.HFPAPI.getRouteJourneys(routeId, direction, departureDate)
  return createRouteJourneysResponse(getJourney, routeId, direction, departureDate)
}

const vehicleJourneys = (root, { uniqueVehicleId, date }, { dataSources }) => {
  const getVehicleJourneys = () => dataSources.HFPAPI.getJourneysForVehicle(uniqueVehicleId, date)
  return createVehicleJourneysResponse(getVehicleJourneys, uniqueVehicleId, date)
}

const eventsByBbox = (root, { minTime, maxTime, bbox, date, filters }, { dataSources }) => {
  const getAreaJourneys = () => dataSources.HFPAPI.getAreaJourneys(minTime, maxTime, bbox, date)
  return createAreaJourneysResponse(getAreaJourneys, minTime, maxTime, bbox, date, filters)
}

const exceptionDays = (root, { year }, { dataSources }) => {
  // The full resolver is in the Jore datasource because we need it for other queries too.
  return dataSources.JoreAPI.getExceptions(year)
}

const alerts = (root, { time, queryId, queryType }, { dataSources }): Alert[] => {
  return [
    {
      title: 'Route 2551 alien abduction',
      affectedId: '2551',
      id: '123',
      alertLevel: AlertLevel.Disruption,
      description: 'An alien abducted the driver.',
      distribution: AlertDistribution.Route,
      startDateTime: '2019-05-06T08:10:00+0300',
      endDateTime: '2019-05-06T09:10:00+0300',
      url: 'https://hsl.fi',
    },
    {
      title: 'Herttoniemi sinkhole',
      affectedId: '1058',
      id: '456',
      alertLevel: AlertLevel.Disruption,
      description: "A sinkhole opened up in Herttoniemi and swallowed one of route 1058's buses.",
      distribution: AlertDistribution.Route,
      startDateTime: '2019-05-06T13:00:00+0300',
      endDateTime: '2019-05-06T14:00:00+0300',
      url: 'https://hsl.fi',
    },
  ]
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
  routeDepartures,
  weeklyDepartures,
  journey,
  vehicleJourneys,
  journeys,
  eventsByBbox,
  exceptionDays,
  // @ts-ignore
  alerts,
}
