import { QueryResolvers } from '../types/generated/resolver-types'
import { createRouteResponse, createRoutesResponse } from '../creators/createRoutesResponse'
import { createStopResponse, createStopsResponse } from '../creators/createStopsResponse'
import { createRouteGeometryResponse } from '../creators/createRouteGeometryResponse'
import { createEquipmentResponse } from '../creators/createEquipmentResponse'
import { createJourneyResponse } from '../creators/createJourneyResponse'
import { createDeparturesResponse } from '../creators/createDeparturesResponse'
import { createRouteSegmentsResponse } from '../creators/createRouteSegmentsResponse'
import { createVehicleJourneysResponse } from '../creators/createVehicleJourneysResponse'
import { createAreaJourneysResponse } from '../creators/createAreaJourneysResponse'
import { createRouteJourneysResponse } from '../creators/createRouteJourneysResponse'
import { createWeekDeparturesResponse } from '../creators/createWeekDeparturesResponse'
import { createRouteDeparturesResponse } from '../creators/createRouteDeparturesResponse'
import { format } from 'date-fns'
import { compact, flatten, get } from 'lodash'
import { getWeekDates } from '../utils/getWeekDates'
import { Alert, Cancellation } from '../types/generated/schema-types'
import { getAlerts } from '../getAlerts'
import { getCancellations } from '../getCancellations'
import { getSettings } from '../datasources/transitlogServer'
import { createUnsignedVehicleEventsResponse } from '../creators/createUnsignedVehicleEventsResponse'
import { createDriverEventsResponse } from '../creators/createDriverEventsResponse'
import {
  createTerminalResponse,
  createTerminalsResponse,
} from '../creators/createTerminalsResponse'

const equipment = (root, { filter, date }, { dataSources, user, skipCache }) => {
  const getEquipment = () => dataSources.JoreAPI.getEquipment()
  const getObservedVehicles = () => dataSources.HFPAPI.getAvailableVehicles(date)
  return createEquipmentResponse(getEquipment, getObservedVehicles, user, date, skipCache)
}

const stops = (root, { filter, date }, { dataSources, skipCache }) => {
  const getStops = () => dataSources.JoreAPI.getStops(date)
  return createStopsResponse(getStops, date, skipCache)
}

const stop = (root, { stopId, date }, { dataSources, skipCache }) => {
  const getStopSegments = () => dataSources.JoreAPI.getStopSegments(stopId, date)
  return createStopResponse(getStopSegments, date, stopId, skipCache)
}

const terminal = (root, { terminalId, date }, { dataSources, skipCache }) => {
  const getStopSegments = (stopId) => dataSources.JoreAPI.getStopSegments(stopId, date)
  const getTerminals = () => dataSources.JoreAPI.getTerminal(terminalId)

  return createTerminalResponse(getTerminals, getStopSegments, terminalId, date, skipCache)
}

const terminals = (root, { date }, { dataSources, skipCache }) => {
  const getTerminals = () => dataSources.JoreAPI.getTerminals()
  return createTerminalsResponse(getTerminals, date, skipCache)
}

const route = async (root, { routeId, direction, date }, { dataSources, user, skipCache }) => {
  const getRoute = () => dataSources.JoreAPI.getRoute(routeId, direction)

  const fetchCancellations = getCancellations.bind(
    null,
    user,
    dataSources.HFPAPI.getCancellations,
    () => dataSources.JoreAPI.getDepartureOperators(date)
  )

  return createRouteResponse(getRoute, fetchCancellations, date, routeId, direction, skipCache)
}

const routes = async (root, { filter, date }, { dataSources, user, skipCache }) => {
  const getRoutes = () => dataSources.JoreAPI.getRoutes()

  const fetchCancellations = getCancellations.bind(
    null,
    user,
    dataSources.HFPAPI.getCancellations,
    () => dataSources.JoreAPI.getDepartureOperators(date)
  )

  return createRoutesResponse(user, getRoutes, fetchCancellations, date, filter, skipCache)
}

const routeGeometry = (root, { date, routeId, direction }, { dataSources }) => {
  const getRouteGeometry = () => dataSources.JoreAPI.getRouteGeometry(routeId, direction, date)
  return createRouteGeometryResponse(getRouteGeometry, date, routeId, direction)
}

const routeSegments = (
  root,
  { routeId, direction, date },
  { dataSources, user, skipCache }
) => {
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
    direction,
    skipCache
  )
}

const departures = async (
  root,
  { filter, stopId = '', terminalId = '', date },
  { dataSources, user, skipCache }
) => {
  const exceptions = await dataSources.JoreAPI.getExceptions(date)

  const getTerminals = () => dataSources.JoreAPI.getTerminalStops(terminalId)

  const getDepartures = (fetchStops: string[]) =>
    dataSources.JoreAPI.getDeparturesForStops(fetchStops, date)

  const getStops = () => {
    if (terminalId) {
      return dataSources.JoreAPI.getTerminalDeparturesStops(terminalId, date)
    }

    return dataSources.JoreAPI.getDeparturesStops(stopId, date)
  }

  const getDepartureEvents = (stopIds: string[]) =>
    dataSources.HFPAPI.getDepartureEvents(stopIds, date)

  const fetchCancellations = getCancellations.bind(
    null,
    user,
    dataSources.HFPAPI.getCancellations,
    () => dataSources.JoreAPI.getDepartureOperators(date)
  )

  const fetchAlerts = getAlerts.bind(null, dataSources.HFPAPI.getAlerts)

  return createDeparturesResponse(
    getDepartures,
    getStops,
    getTerminals,
    getDepartureEvents,
    fetchCancellations,
    fetchAlerts,
    exceptions,
    stopId,
    terminalId,
    date,
    filter,
    user,
    skipCache
  )
}

const routeDepartures = async (
  root,
  { routeId, direction, stopId, date },
  { dataSources, user, skipCache }
) => {
  const exceptions = await dataSources.JoreAPI.getExceptions(date)
  const getPassengerCount = () =>
    dataSources.HFPAPI.getPassengerCounts(routeId, direction, date)
  const fetchAlerts = getAlerts.bind(null, dataSources.HFPAPI.getAlerts)

  const getDepartures = () =>
    dataSources.JoreAPI.getDeparturesForRoute(stopId, routeId, direction, date)

  const getStops = () => dataSources.JoreAPI.getDeparturesStops(stopId, date)

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
    getPassengerCount,
    getDepartures,
    getStops,
    getDepartureEvents,
    fetchCancellations,
    fetchAlerts,
    exceptions,
    stopId,
    routeId,
    direction,
    date,
    skipCache
  )
}

const weeklyDepartures = async (
  root,
  { routeId, direction, stopId, date, lastStopArrival },
  { dataSources, skipCache }
) => {
  const weekDates = getWeekDates(date)

  const exceptionPromises = weekDates.map((date) =>
    dataSources.JoreAPI.getExceptions(format(date, 'YYYY-MM-DD'))
  )

  let exceptionsForWeek = await Promise.all(exceptionPromises)
  exceptionsForWeek = flatten(exceptionsForWeek)

  const exceptionDayTypes: string[] = compact(
    flatten(exceptionsForWeek.map(({ effectiveDayTypes }) => effectiveDayTypes))
  )

  const getDepartures = () =>
    dataSources.JoreAPI.getWeeklyDepartures(
      stopId,
      routeId,
      direction,
      exceptionDayTypes,
      lastStopArrival
    )

  const getStops = () => dataSources.JoreAPI.getDeparturesStops(stopId, date, lastStopArrival)

  const getDepartureEvents = (fetchDate) =>
    dataSources.HFPAPI.getRouteDepartureEvents(
      stopId,
      fetchDate,
      routeId,
      direction,
      lastStopArrival
    )

  const fetchCancellations = getCancellations.bind(
    null,
    null,
    dataSources.HFPAPI.getCancellations,
    () => dataSources.JoreAPI.getDepartureOperators(date)
  )

  const fetchAlerts = getAlerts.bind(null, dataSources.HFPAPI.getAlerts)

  return createWeekDeparturesResponse(
    getDepartures,
    getStops,
    getDepartureEvents,
    fetchCancellations,
    fetchAlerts,
    exceptionsForWeek,
    stopId,
    routeId,
    direction,
    date,
    lastStopArrival,
    skipCache
  )
}

const journey = async (
  root,
  {
    routeId,
    direction,
    departureTime,
    departureDate,
    uniqueVehicleId,
    unsignedEvents = false,
  },
  { dataSources, user, skipCache }
) => {
  const exceptions = await dataSources.JoreAPI.getExceptions(departureDate)

  const getRouteData = () =>
    dataSources.JoreAPI.getDepartureData(routeId, direction, departureDate)

  const getStopData = (stopId: string) => dataSources.JoreAPI.getSimpleStop(stopId)

  const getJourneyEvents = () =>
    dataSources.HFPAPI.getJourneyEvents(
      routeId,
      direction,
      departureDate,
      departureTime,
      uniqueVehicleId
    )

  const getUnsignedEvents = (vehicleId: string) =>
    dataSources.HFPAPI.getUnsignedEventsForVehicle(departureDate, vehicleId)

  const getPassengerCountData = () =>
    dataSources.HFPAPI.getPassengerCountByDeparture(
      routeId,
      direction,
      departureDate,
      departureTime
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
    user,
    getPassengerCountData,
    getRouteData,
    getJourneyEvents,
    getJourneyEquipment,
    getStopData,
    getUnsignedEvents,
    fetchCancellations,
    fetchAlerts,
    exceptions,
    routeId,
    direction,
    departureDate,
    departureTime,
    uniqueVehicleId,
    false,
    skipCache
  )
}

const journeys = (root, { routeId, direction, departureDate }, { dataSources, skipCache }) => {
  const getJourney = () =>
    dataSources.HFPAPI.getRouteJourneys(routeId, direction, departureDate)

  return createRouteJourneysResponse(getJourney, routeId, direction, departureDate, skipCache)
}

const vehicleJourneys = (
  root,
  { uniqueVehicleId, date },
  { dataSources, user, skipCache }
) => {
  const getVehicleJourneys = () =>
    dataSources.HFPAPI.getJourneysForVehicle(uniqueVehicleId, date)

  const fetchAlerts = getAlerts.bind(null, dataSources.HFPAPI.getAlerts)

  return createVehicleJourneysResponse(
    user,
    getVehicleJourneys,
    fetchAlerts,
    uniqueVehicleId,
    date,
    skipCache
  )
}

const driverEvents = (root, { uniqueVehicleId, date }, { dataSources, user, skipCache }) => {
  const getDriverEvents = () => dataSources.HFPAPI.getDriverEvents(uniqueVehicleId, date)
  return createDriverEventsResponse(user, getDriverEvents, uniqueVehicleId, date, skipCache)
}

const unsignedVehicleEvents = (
  root,
  { uniqueVehicleId, date },
  { dataSources, user, skipCache }
) => {
  const getUnsignedEvents = () =>
    dataSources.HFPAPI.getUnsignedEventsForVehicle(date, uniqueVehicleId)

  return createUnsignedVehicleEventsResponse(
    getUnsignedEvents,
    uniqueVehicleId,
    date,
    user,
    skipCache
  )
}

const journeysByBbox = (
  root,
  { minTime, maxTime, bbox, date, filters, unsignedEvents = true },
  { dataSources, user }
) => {
  const getAreaJourneys = () =>
    dataSources.HFPAPI.getAreaJourneys(minTime, maxTime, bbox, date, !!user && unsignedEvents)

  return createAreaJourneysResponse(
    getAreaJourneys,
    minTime,
    maxTime,
    bbox,
    date,
    filters,
    unsignedEvents,
    user
  )
}

const exceptionDays = (root, { year }, { dataSources }) => {
  // The full resolver is in the Jore datasource because we need it for other queries too.
  return dataSources.JoreAPI.getExceptions(year)
}

const alerts = (
  root,
  { time, language, alertSearch },
  { dataSources, skipCache }
): Promise<Alert[]> => {
  return getAlerts(dataSources.HFPAPI.getAlerts, time, alertSearch, language, skipCache)
}

const cancellations = (
  root,
  { date, cancellationSearch },
  { dataSources, user, skipCache }
): Promise<Cancellation[]> => {
  return getCancellations(
    user,
    dataSources.HFPAPI.getCancellations,
    () => dataSources.JoreAPI.getDepartureOperators(date),
    date,
    cancellationSearch,
    skipCache
  )
}

const uiMessage = async () => {
  const settings = await getSettings()
  return get(settings, 'ui_message', { date: '', message: '' })
}

export const queryResolvers: QueryResolvers = {
  equipment,
  stop,
  stops,
  terminal,
  terminals,
  route,
  routes,
  routeGeometry,
  routeSegments,
  departures,
  routeDepartures,
  weeklyDepartures,
  journey,
  vehicleJourneys,
  driverEvents,
  unsignedVehicleEvents,
  journeys,
  journeysByBbox,
  exceptionDays,
  alerts,
  cancellations,
  uiMessage,
}
