import { JoreRouteDepartureData, JoreEquipment, JoreRoute, JoreStopSegment } from '../types/Jore'
import { cacheFetch } from './cache'
import { Vehicles } from '../types/generated/hfp-types'
import { Departure, Direction, Journey, Route, VehicleId } from '../types/generated/schema-types'
import { createJourneyId } from '../utils/createJourneyId'
import { filterByDateChains } from '../utils/filterByDateChains'
import { get, groupBy, last, uniqBy } from 'lodash'
import { createJourneyObject } from './objects/createJourneyObject'
import { getDepartureTime } from '../utils/time'
import { CachedFetcher } from '../types/CachedFetcher'
import { createPlannedDepartureObject } from './objects/createDepartureObject'
import { PlannedDeparture } from '../types/PlannedDeparture'
import { getStopArrivalData } from '../utils/getStopArrivalData'
import { getStopDepartureData } from '../utils/getStopDepartureData'
import { createRouteObject } from './objects/createRouteObject'
import { getStopEvents } from '../utils/getStopEvents'
import { createRouteSegmentObject } from './objects/createRouteSegmentObject'
import { groupEventsByInstances } from '../utils/groupEventsByInstances'
import { createValidVehicleId } from '../utils/createUniqueVehicleId'
import { journeyInProgress } from '../utils/journeyInProgress'
import { getDirection } from '../utils/getDirection'

type JourneyRoute = {
  route: Route
  departures: PlannedDeparture[]
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

  return journeyEvents.filter((pos) => !!pos.journey_start_time)
}

/**
 * Fetch the full route data with segments, stops and departures, and reduce that down to
 * a list of planned departures for each stop of the route. Returns the basic route data and
 * the list of departures.
 * @param fetcher The async function that fetches the full route data
 * @param date The date during which that the route and departures should be valid.
 * @param time The time of the planned departure from the first stop.
 * @returns Promise<JourneyRoute> Includes the route data and the departures.
 */
const fetchJourneyDepartures: CachedFetcher<JourneyRoute> = async (fetcher, date, time) => {
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

    const stop = stopSegment ? createRouteSegmentObject(stopSegment) : null
    return createPlannedDepartureObject(departure, stop, date)
  })

  // Return both the route and the departures that we put so much work into parsing.
  // Note that the route is also returned as a domain object.
  return { route: journeyRouteObject, departures: stopDepartures }
}

/**
 * This function fetches both the journey events and the journey departures using the functions
 * above and caches the result, which is a merge of the planned and observed data.
 * @param fetchRouteData Async function that fetches the route and departures from Jore
 * @param fetchJourneyEvents Async function that fetches the HFP events
 * @param fetchJourneyEquipment Async function that fetches the equipment that operated this journey.
 * @param routeId The route ID of the requested journey
 * @param direction The direction of the requested journey
 * @param departureDate The operation date of the journey
 * @param departureTime The journey's departure from the first stop.
 * @param uniqueVehicleId
 */
export async function createJourneyResponse(
  fetchRouteData: () => Promise<JourneyRouteData>,
  fetchJourneyEvents: () => Promise<Vehicles[]>,
  fetchJourneyEquipment: (
    vehicleId: string | number,
    operatorId: string
  ) => Promise<JoreEquipment[]>,
  routeId: string,
  direction: Direction,
  departureDate: string,
  departureTime: string,
  uniqueVehicleId: VehicleId
): Promise<Journey | null> {
  // Return the cache key without needing the data if htere is a uniqueVehicleId provided.
  // If not, it needs to the data to get the vehicle ID.
  function getJourneyEventsKey(events: Vehicles[] = []) {
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
    } else if (events.length !== 0) {
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
  const fetchAndProcessJourney: CachedFetcher<Journey> = async () => {
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
        return 5 * 60
      }
    )

    if (!journeyEvents || journeyEvents.length === 0) {
      return false
    }

    const journeyKey = getJourneyEventsKey(journeyEvents)

    // Fetch the planned departures and the route.
    const routeCacheKey = `journey_route_departures_${journeyKey}`
    const routeAndDepartures = await cacheFetch<JourneyRoute>(
      routeCacheKey,
      () => fetchJourneyDepartures(fetchRouteData, departureDate, departureTime),
      24 * 60 * 60
    )

    const events: Vehicles[] = journeyEvents

    // Return only the events if no departures were found.
    if (
      !routeAndDepartures ||
      (!routeAndDepartures.route && routeAndDepartures.departures.length === 0)
    ) {
      return createJourneyObject(
        events,
        get(routeAndDepartures, 'route', null),
        get(routeAndDepartures, 'departures', []),
        null
      )
    }

    const { route, departures } = routeAndDepartures

    // Add observed data to the departures. Each stop is given a pile of events from which
    // arrival and departure times for the stop is parsed.
    const observedDepartures: Departure[] = departures.map(
      (departure: PlannedDeparture): Departure => {
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

        // Add the observed times and events to the planned departure data.
        return {
          ...departure,
          observedDepartureTime: stopDeparture,
          observedArrivalTime: stopArrival,
        }
      }
    )

    // Get the ID of the vehicle that actually operated this journey and fetch its data.
    const { owner_operator_id, vehicle_number } = events[0]

    const equipmentKey = `equipment_${owner_operator_id}_${vehicle_number}`

    const journeyEquipment = await cacheFetch<JoreEquipment[]>(equipmentKey, () =>
      fetchJourneyEquipment(vehicle_number, owner_operator_id)
    )

    // Everything is baked into a Journey domain object.
    return createJourneyObject(
      events,
      route,
      observedDepartures,
      get(journeyEquipment, '[0]', null)
    )
  }

  // Decide a suitable TTL for the cached journey based on if the journey is completed or not.
  const getJourneyTTL = (data: Journey) => {
    const lastDeparture = last(data.departures)

    // If the last departure has observed data, we know the journey is near its end.
    if (lastDeparture && lastDeparture.observedArrivalTime) {
      // @ts-ignore
      if (!journeyInProgress(data.events)) {
        return 30 * 24 * 60 * 60 // Cache for a month.
      }

      // If the last stop has observed data but the event stream hasn't finished yet, cache for 5 seconds.
      return 5
    } else {
      return 1 // Cache ongoing journeys for 1 second.
    }
  }

  // Note that the journey is cached but cannot be retrieved from the cache
  // if createJourneyResponse was called without uniqueVehicleId.
  const getJourneyCacheKey = (data?: Journey) => {
    let journeyKey: false | string = false

    if (data && !uniqueVehicleId) {
      journeyKey = data.id
    } else if (uniqueVehicleId) {
      journeyKey = createJourneyId({
        routeId,
        direction,
        departureDate,
        departureTime,
        uniqueVehicleId,
      })
    }

    return !journeyKey ? false : `journey_${journeyKey}`
  }

  const journey = await cacheFetch<Journey>(
    getJourneyCacheKey,
    fetchAndProcessJourney,
    getJourneyTTL
  )

  if (!journey) {
    return null
  }

  return journey
}
