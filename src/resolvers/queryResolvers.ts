import { QueryResolvers } from '../types/generated/resolver-types'
import { createLinesResponse } from '../app/createLinesResponse'
import { createRouteResponse, createRoutesResponse } from '../app/createRoutesResponse'
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
import { compact, flatten, get } from 'lodash'
import { getWeekDates } from '../utils/getWeekDates'
import { Alert, Cancellation } from '../types/generated/schema-types'
import { getAlerts } from '../app/getAlerts'
import { getCancellations } from '../app/getCancellations'
import { getSettings } from '../datasources/transitlogServer'
import { createUnsignedJourneysResponse } from '../app/createUnsignedJourneysResponse'

const equipment = (root, { filter, date }, { dataSources }) => {
  const getEquipment = () => dataSources.JoreAPI.getEquipment()
  const getObservedVehicles = () => dataSources.HFPAPI.getAvailableVehicles(date)
  return createEquipmentResponse(getEquipment, getObservedVehicles, filter, date)
}

const stops = (root, { filter, date }, { dataSources }) => {
  const getStops = () => dataSources.JoreAPI.getStops(date)
  const fetchAlerts = getAlerts.bind(null, dataSources.HFPAPI.getAlerts)
  return createStopsResponse(getStops, fetchAlerts, date, filter)
}

const stopsByBbox = (root, { filter, bbox }, { dataSources }) => {
  const getStops = () => dataSources.JoreAPI.getStops()
  const fetchAlerts = getAlerts.bind(null, dataSources.HFPAPI.getAlerts)
  return createStopsResponse(getStops, fetchAlerts, '', filter, bbox)
}

const stop = (root, { stopId, date }, { dataSources }) => {
  const getStopSegments = () => dataSources.JoreAPI.getStopSegments(stopId, date)
  const fetchAlerts = getAlerts.bind(null, dataSources.HFPAPI.getAlerts)
  return createStopResponse(getStopSegments, fetchAlerts, date, stopId)
}

const route = async (root, { routeId, direction, date }, { dataSources, user }) => {
  const getRoute = () => dataSources.JoreAPI.getRoute(routeId, direction)

  const fetchCancellations = getCancellations.bind(
    null,
    user,
    dataSources.HFPAPI.getCancellations,
    () => dataSources.JoreAPI.getDepartureOperators(date)
  )

  const fetchAlerts = getAlerts.bind(null, dataSources.HFPAPI.getAlerts)
  return createRouteResponse(
    getRoute,
    fetchCancellations,
    fetchAlerts,
    date,
    routeId,
    direction
  )
}

const routes = async (root, { filter, line, date }, { dataSources, user }) => {
  const getRoutes = () => dataSources.JoreAPI.getRoutes()

  const fetchCancellations = getCancellations.bind(
    null,
    user,
    dataSources.HFPAPI.getCancellations,
    () => dataSources.JoreAPI.getDepartureOperators(date)
  )

  const fetchAlerts = getAlerts.bind(null, dataSources.HFPAPI.getAlerts)
  return createRoutesResponse(
    user,
    getRoutes,
    fetchCancellations,
    fetchAlerts,
    date,
    line,
    filter
  )
}

const routeGeometry = (root, { date, routeId, direction }, { dataSources }) => {
  const getRouteGeometry = () => dataSources.JoreAPI.getRouteGeometry(routeId, direction, date)
  return createRouteGeometryResponse(getRouteGeometry, date, routeId, direction)
}

const routeSegments = (root, { routeId, direction, date }, { dataSources, user }) => {
  const getRouteSegments = () => dataSources.JoreAPI.getRouteSegments(routeId, direction)

  const fetchCancellations = getCancellations.bind(
    null,
    user,
    dataSources.HFPAPI.getCancellations,
    () => dataSources.JoreAPI.getDepartureOperators(date)
  )

  const fetchAlerts = getAlerts.bind(null, dataSources.HFPAPI.getAlerts)

  return createRouteSegmentsResponse(
    user,
    getRouteSegments,
    fetchCancellations,
    fetchAlerts,
    date,
    routeId,
    direction
  )
}

const lines = async (root, { filter, date }, { dataSources }) => {
  const getLines = () => dataSources.JoreAPI.getLines()
  return createLinesResponse(getLines, date, filter)
}

const departures = async (root, { filter, stopId, date }, { dataSources, user }) => {
  const exceptions = await dataSources.JoreAPI.getExceptions(date)
  const getDepartures = () => dataSources.JoreAPI.getDeparturesForStop(stopId, date)
  const getStops = () => dataSources.JoreAPI.getDepartureStops(stopId, date)
  const getDepartureEvents = () => dataSources.HFPAPI.getDepartureEvents(stopId, date)

  const fetchCancellations = getCancellations.bind(
    null,
    user,
    dataSources.HFPAPI.getCancellations,
    () => dataSources.JoreAPI.getDepartureOperators(date)
  )

  const fetchAlerts = getAlerts.bind(null, dataSources.HFPAPI.getAlerts)

  return createDeparturesResponse(
    user,
    getDepartures,
    getStops,
    getDepartureEvents,
    fetchCancellations,
    fetchAlerts,
    exceptions,
    stopId,
    date,
    filter
  )
}

const routeDepartures = async (
  root,
  { routeId, direction, stopId, date },
  { dataSources, user }
) => {
  const exceptions = await dataSources.JoreAPI.getExceptions(date)

  const fetchAlerts = getAlerts.bind(null, dataSources.HFPAPI.getAlerts)

  if (routeId === 'unsigned') {
    return createUnsignedJourneysResponse(
      user,
      () => dataSources.HFPAPI.getUnsignedEvents(date),
      date
    )
  }

  const getDepartures = () =>
    dataSources.JoreAPI.getDeparturesForRoute(stopId, routeId, direction, date)

  const getStops = () => dataSources.JoreAPI.getDepartureStops(stopId, date)

  const getDepartureEvents = () =>
    dataSources.HFPAPI.getRouteDepartureEvents(stopId, date, routeId, direction)

  const fetchCancellations = getCancellations.bind(
    null,
    user,
    dataSources.HFPAPI.getCancellations,
    () => dataSources.JoreAPI.getDepartureOperators(date)
  )

  return createRouteDeparturesResponse(
    user,
    getDepartures,
    getStops,
    getDepartureEvents,
    fetchCancellations,
    fetchAlerts,
    exceptions,
    stopId,
    routeId,
    direction,
    date
  )
}

const weeklyDepartures = async (
  root,
  { routeId, direction, stopId, date },
  { dataSources, user }
) => {
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

  const getDepartureEvents = (fetchDate) =>
    dataSources.HFPAPI.getRouteDepartureEvents(stopId, fetchDate, routeId, direction)

  const fetchCancellations = getCancellations.bind(
    null,
    user,
    dataSources.HFPAPI.getCancellations,
    () => dataSources.JoreAPI.getDepartureOperators(date)
  )

  const fetchAlerts = getAlerts.bind(null, dataSources.HFPAPI.getAlerts)

  return createWeekDeparturesResponse(
    user,
    getDepartures,
    getStops,
    getDepartureEvents,
    fetchCancellations,
    fetchAlerts,
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

  const getRouteData = () =>
    dataSources.JoreAPI.getDepartureData(routeId, direction, departureDate)

  const getStopData = (stopId) => dataSources.JoreAPI.getSimpleStop(stopId)

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

  const fetchCancellations = getCancellations.bind(
    null,
    user,
    dataSources.HFPAPI.getCancellations,
    () => dataSources.JoreAPI.getDepartureOperators(departureDate)
  )

  const fetchAlerts = getAlerts.bind(null, dataSources.HFPAPI.getAlerts)

  return createJourneyResponse(
    getRouteData,
    getJourneyEvents,
    getJourneyEquipment,
    getStopData,
    fetchCancellations,
    fetchAlerts,
    exceptions,
    routeId,
    direction,
    departureDate,
    departureTime,
    uniqueVehicleId
  )
}

const journeys = (root, { routeId, direction, departureDate }, { dataSources }) => {
  const getJourney = () =>
    dataSources.HFPAPI.getRouteJourneys(routeId, direction, departureDate)
  return createRouteJourneysResponse(getJourney, routeId, direction, departureDate)
}

const vehicleJourneys = (root, { uniqueVehicleId, date }, { dataSources }) => {
  const getVehicleJourneys = () =>
    dataSources.HFPAPI.getJourneysForVehicle(uniqueVehicleId, date)
  const fetchAlerts = getAlerts.bind(null, dataSources.HFPAPI.getAlerts)
  return createVehicleJourneysResponse(getVehicleJourneys, fetchAlerts, uniqueVehicleId, date)
}

const eventsByBbox = (root, { minTime, maxTime, bbox, date, filters }, { dataSources }) => {
  const getAreaJourneys = () =>
    dataSources.HFPAPI.getAreaJourneys(minTime, maxTime, bbox, date)
  return createAreaJourneysResponse(getAreaJourneys, minTime, maxTime, bbox, date, filters)
}

const exceptionDays = (root, { year }, { dataSources }) => {
  // The full resolver is in the Jore datasource because we need it for other queries too.
  return dataSources.JoreAPI.getExceptions(year)
}

const alerts = (root, { time, language, alertSearch }, { dataSources }): Promise<Alert[]> => {
  return getAlerts(dataSources.HFPAPI.getAlerts, time, alertSearch, language)
}

const cancellations = (
  root,
  { date, cancellationSearch },
  { dataSources, user }
): Promise<Cancellation[]> => {
  return getCancellations(
    user,
    dataSources.HFPAPI.getCancellations,
    () => dataSources.JoreAPI.getDepartureOperators(date),
    date,
    cancellationSearch
  )
}

const uiMessage = async () => {
  const settings = await getSettings()
  return get(settings, 'ui_message', { date: '', message: '' })
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
  alerts,
  cancellations,
  uiMessage,
}
