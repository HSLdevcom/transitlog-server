import {
  JoreDeparture,
  JoreEquipment,
  JoreRouteDepartureData,
  JoreStopSegment,
} from '../types/Jore'
import { cacheFetch } from './cache'
import { Vehicles } from '../types/generated/hfp-types'
import {
  Departure,
  Direction,
  ExceptionDay,
  Journey,
  Route,
  VehicleId,
} from '../types/generated/schema-types'
import { createJourneyId } from '../utils/createJourneyId'
import { filterByDateChains } from '../utils/filterByDateChains'
import { compact, get, groupBy, orderBy } from 'lodash'
import { createJourneyObject } from './objects/createJourneyObject'
import { getDateFromDateTime, getDepartureTime } from '../utils/time'
import { CachedFetcher } from '../types/CachedFetcher'
import { createPlannedDepartureObject } from './objects/createDepartureObject'
import { getStopArrivalData } from '../utils/getStopArrivalData'
import { getStopDepartureData } from '../utils/getStopDepartureData'
import { createRouteObject } from './objects/createRouteObject'
import { getStopEvents } from '../utils/getStopEvents'
import { createRouteSegmentObject } from './objects/createRouteSegmentObject'
import { groupEventsByInstances } from '../utils/groupEventsByInstances'
import { createValidVehicleId } from '../utils/createUniqueVehicleId'
import { journeyInProgress } from '../utils/journeyInProgress'
import { getDirection } from '../utils/getDirection'
import { filterByExceptions } from '../utils/filterByExceptions'
import { requireUser } from '../auth/requireUser'
import { getAlerts } from './getAlerts'
import { getCancellations } from './getCancellations'
import {
  setAlertsOnDeparture,
  setCancellationsOnDeparture,
} from '../utils/setCancellationsAndAlerts'

type JourneyRoute = {
  route: Route | null
  departures: Departure[]
}

export type JourneyRouteData = {
  departures: JoreRouteDepartureData[]
  stops: JoreStopSegment[]
}

/**
 * Fetch the journey events and filter out the invalid ones.
 * The value from this function is not cached, but it could be.
 * @param fetcher async function that fetches the journey events
 * @param uniqueVehicleId string that identifies the requested vehicle
 * @returns Promise<Vehicles[]> the filtered events
 */
const fetchValidJourneyEvents: CachedFetcher<Vehicles[]> = async (fetcher, uniqueVehicleId) => {
  const events = await fetcher()

  if (events.length === 0) {
    return false
  }

  // There could have been many vehicles operating this journey. Separate them by
  // vehicle ID and use the instance argument to select the set of events.
  const vehicleGroups = groupEventsByInstances(events || [])
  let journeyEvents

  if (uniqueVehicleId) {
    const selectedVehicleGroups = vehicleGroups.find(
      ([groupId]) => groupId === createValidVehicleId(uniqueVehicleId)
    )

    journeyEvents = selectedVehicleGroups ? selectedVehicleGroups[1] : []
  } else {
    const instanceGroup = vehicleGroups[0]
    journeyEvents = instanceGroup[1]
  }

  const validEvents = journeyEvents.filter((pos) => !!pos.journey_start_time)
  return validEvents.length !== 0 ? validEvents : false
}

/**
 * Fetch the full route data with segments, stops and departures, and reduce that down to
 * a list of planned departures for each stop of the route. Returns the basic route data and
 * the list of departures.
 * @param fetcher The async function that fetches the full route data
 * @param date The date during which that the route and departures should be valid.
 * @param time The time of the planned departure from the first stop.
 * @param exceptions
 * @returns Promise<JourneyRoute> Includes the route data and the departures.
 */
const fetchJourneyDepartures: CachedFetcher<JourneyRoute> = async (
  fetcher,
  date,
  time,
  exceptions
) => {
  const journeyRoute: JourneyRouteData = await fetcher()

  if (journeyRoute.departures.length === 0 || journeyRoute.stops.length === 0) {
    return false
  }

  const departures: JoreRouteDepartureData[] = get(journeyRoute, 'departures', []) || []
  const stops: JoreStopSegment[] = get(journeyRoute, 'stops', []) || []
  // A stop segment contains all necessary info for the route
  const journeyRouteObject = createRouteObject(stops[0])

  const validDepartures = filterByDateChains<JoreRouteDepartureData>(
    groupBy(
      departures,
      ({ departure_id, stop_id, day_type, extra_departure }) =>
        `${departure_id}_${stop_id}_${day_type}_${extra_departure}`
    ),
    date
  )

  // The first departure of the journey is found by matching the departure time of the
  // requested journey. This is the time argument. Note that it will be given as a 24h+ time.,
  // so we also need to get a 24+ time for the departure using `getDepartureTime`.
  const originDeparture = validDepartures.find(
    (departure) =>
      getDepartureTime(departure) === time && departure.stop_id === journeyRouteObject.originStopId
  )

  if (!originDeparture) {
    return { route: journeyRouteObject, departures: [] }
  }

  const stopSegmentGroups = groupBy(stops, 'stop_index')
  const validStops = filterByDateChains<JoreStopSegment>(stopSegmentGroups, date)

  if (validStops.length === 0) {
    return { route: journeyRouteObject, departures: [] }
  }

  const journeyDepartures = validDepartures.filter(
    (departure) =>
      originDeparture.day_type === departure.day_type &&
      originDeparture.departure_id === departure.departure_id
  )

  const stopDepartures = journeyDepartures.map((departure) => {
    const stopSegment = validStops.find(
      (stopSegment) =>
        stopSegment.stop_id === departure.stop_id &&
        stopSegment.route_id === departure.route_id &&
        getDirection(stopSegment.direction) === getDirection(departure.direction)
    )

    if (!stopSegment) {
      return null
    }

    const stop = createRouteSegmentObject(stopSegment)
    return createPlannedDepartureObject(departure, stop, date, 'journey')
  })

  // Return both the route and the departures that we put so much work into parsing.
  // Note that the route is also returned as a domain object.
  return {
    route: journeyRouteObject,
    departures: filterByExceptions(orderBy(compact(stopDepartures), 'index'), exceptions),
  }
}

/**
 * This function fetches both the journey events and the journey departures using the functions
 * above and caches the result, which is a merge of the planned and observed data.
 * @param fetchRouteData Async function that fetches the route and departures from Jore
 * @param fetchJourneyEvents Async function that fetches the HFP events
 * @param fetchJourneyEquipment Async function that fetches the equipment that operated this journey.
 * @param exceptions Exceptions in effect during departureDate
 * @param routeId The route ID of the requested journey
 * @param direction The direction of the requested journey
 * @param departureDate The operation date of the journey
 * @param departureTime The journey's departure from the first stop.
 * @param uniqueVehicleId
 * @param user
 */
export async function createJourneyResponse(
  fetchRouteData: () => Promise<JourneyRouteData>,
  fetchJourneyEvents: () => Promise<Vehicles[]>,
  fetchJourneyEquipment: (
    vehicleId: string | number,
    operatorId: string
  ) => Promise<JoreEquipment[]>,
  exceptions: ExceptionDay[],
  routeId: string,
  direction: Direction,
  departureDate: string,
  departureTime: string,
  uniqueVehicleId: VehicleId,
  user
): Promise<Journey | null> {
  // Return the cache key without needing the data if there is a uniqueVehicleId provided.
  // If not, it needs to the data to get the vehicle ID.
  function getJourneyEventsKey(events: Vehicles[] | null = []) {
    let journeyKey

    const journeyKeyParts = {
      routeId,
      direction,
      departureDate,
      departureTime,
      uniqueVehicleId: '',
    }

    if (uniqueVehicleId) {
      journeyKey = createJourneyId({
        ...journeyKeyParts,
        uniqueVehicleId,
      })
    } else if (events && events.length !== 0) {
      journeyKey = createJourneyId({
        ...journeyKeyParts,
        uniqueVehicleId: get(events, '[0].unique_vehicle_id'),
      })
    } else {
      journeyKey = createJourneyId(journeyKeyParts)
    }

    return journeyKey
  }

  // Fetch events, route and departures, and match events to departures.
  // Return the full journey data.
  const journeyEvents = await cacheFetch(
    (fetchedEvents) => {
      const key = getJourneyEventsKey(fetchedEvents)
      return `journey_events_${key}`
    },
    () => fetchValidJourneyEvents(fetchJourneyEvents),
    (data) => {
      if (journeyInProgress(data)) {
        return 2
      }
      return 24 * 60 * 60
    }
  )

  const journeyKey = getJourneyEventsKey(journeyEvents)

  // Fetch the planned departures and the route.
  const routeCacheKey = `journey_route_departures_${journeyKey}`
  const routeAndDepartures = await cacheFetch<JourneyRoute>(
    routeCacheKey,
    () => fetchJourneyDepartures(fetchRouteData, departureDate, departureTime, exceptions),
    24 * 60 * 60
  )

  if (!journeyEvents && !routeAndDepartures) {
    return null
  }

  const { route, departures = [] }: JourneyRoute = routeAndDepartures || {
    route: null,
    departures: [],
  }

  const departureDateTime = getDateFromDateTime(departureDate, departureTime)

  const journeyAlerts = getAlerts(departureDateTime, {
    allRoutes: true,
    allStops: true,
    route: routeId,
    stop:
      departures && departures.length !== 0
        ? departures.map(({ stopId }) => stopId)
        : route
        ? route.originStopId
        : undefined,
  })

  const journeyCancellations = getCancellations(departureDate, {
    routeId,
    direction,
    departureTime,
  })

  if (!journeyEvents) {
    return createJourneyObject([], route, departures, null, journeyAlerts, journeyCancellations)
  }

  const events: Vehicles[] = journeyEvents
  let journeyEquipment: JoreEquipment | null = null

  if (requireUser(user, 'HSL')) {
    // Get the ID of the vehicle that actually operated this journey and fetch its data.
    const { owner_operator_id, vehicle_number } = events[0]
    const equipmentKey = `equipment_${owner_operator_id}_${vehicle_number}`

    const fetchedEquipment = await cacheFetch<JoreEquipment[]>(equipmentKey, () =>
      fetchJourneyEquipment(vehicle_number, owner_operator_id)
    )

    journeyEquipment = get(fetchedEquipment, '[0]', null) || null
  }

  // Return only the events if no departures were found.
  if (
    !routeAndDepartures ||
    (!routeAndDepartures.route && routeAndDepartures.departures.length === 0)
  ) {
    return createJourneyObject(
      events,
      route,
      departures,
      journeyEquipment,
      journeyAlerts,
      journeyCancellations
    )
  }

  // Add observed data to the departures. Each stop is given a pile of events from which
  // arrival and departure times for the stop is parsed.
  const observedDepartures: Departure[] = departures.map(
    (departure: Departure): Departure => {
      // To get the events for a stop, first get all events with the next_stop_id matching
      // the current stop ID and sort by the timestamp in descending order. The departure
      // event will then be the first element in the array.
      const stopEvents = getStopEvents(events, departure.stopId)

      // Although they have a similar signature, the arrival and departure filters do not
      // work the same way. The arrival looks at door openings and the departure uses the
      // desc-sorted events array.
      const stopArrival = departure
        ? getStopArrivalData(stopEvents, departure, departureDate)
        : null

      const stopDeparture = departure
        ? getStopDepartureData(stopEvents, departure, departureDate)
        : null

      // TODO: Require authorization for showing alerts

      setAlertsOnDeparture(departure)
      setCancellationsOnDeparture(departure)

      // Add the observed times and events to the planned departure data.
      return {
        ...departure,
        observedDepartureTime: stopDeparture,
        observedArrivalTime: stopArrival,
      }
    }
  )

  // Everything is baked into a Journey object.
  return createJourneyObject(
    events,
    route,
    observedDepartures,
    journeyEquipment,
    journeyAlerts,
    journeyCancellations
  )
}
