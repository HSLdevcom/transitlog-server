import {
  Departure as JoreDeparture,
  Equipment as JoreEquipment,
  Route as JoreRoute,
  RouteSegment,
} from '../types/generated/jore-types'
import { cacheFetch } from './cache'
import { Vehicles } from '../types/generated/hfp-types'
import { Departure, Direction, Journey, Route } from '../types/generated/schema-types'
import { createJourneyId } from '../utils/createJourneyId'
import { filterByDateChains } from '../utils/filterByDateChains'
import { get, groupBy, orderBy, sortBy } from 'lodash'
import { createJourneyObject } from './objects/createJourneyObject'
import { getDepartureTime } from '../utils/time'
import { CachedFetcher } from '../types/CachedFetcher'
import { StopSegmentCombo } from '../types/StopSegmentCombo'
import { createDepartureId, createPlannedDepartureObject } from './objects/createDepartureObject'
import { PlannedDeparture } from '../types/PlannedDeparture'
import { getStopArrivalData } from '../utils/getStopArrivalData'
import { getStopDepartureData } from '../utils/getStopDepartureData'
import { createStopObject } from './objects/createStopObject'
import { createRouteObject } from './objects/createRouteObject'
import { differenceInSeconds } from 'date-fns'
import { getStopEvents } from '../utils/getStopEvents'

type JourneyRoute = {
  route: Route
  departures: PlannedDeparture[]
}

/**
 * Fetch the journey events and filter out the invalid ones.
 * The value from this function is not cached, but it could be.
 * @param fetcher async function that fetches the journey events
 * @returns Promise<Vehicles[]> the filtered events
 */
const fetchValidJourneyEvents: CachedFetcher<Vehicles[]> = async (fetcher) => {
  const events = await fetcher()

  if (events.length === 0) {
    return false
  }

  return events.filter((pos) => !!pos.journey_start_time)
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
  const journeyRoute = await fetcher()

  if (!journeyRoute) {
    return false
  }

  // A route is divided into route segments, each with a stop. The stop has departures associated
  // with it. To get to the departures, we need to ensure that each route segment is valid
  // and sorted by the stopIndex.
  const routeSegments: RouteSegment[] = get(journeyRoute, 'routeSegments.nodes', []) || []
  const validRouteSegments = filterByDateChains<RouteSegment>(
    groupBy(routeSegments, 'stopIndex'),
    date
  )
  const sortedRouteSegments = sortBy(validRouteSegments, 'stopIndex')

  // The sorted array of segments can then be further reduced to stops. This returns an array
  // of objects which have data from both the stop and the route segment. Crucially, the
  // segment carries the information about which stop is a timing stop. The segment can
  // be seen as the "glue" between the journey and the stops, since stops are otherwise
  // oblivious to route-specific things. We want route-aware stops which segments provide.
  const stops = sortedRouteSegments.map(
    (routeSegment): StopSegmentCombo => {
      // Group by departure and filter out any invalid departures.
      const groupedDepartures = groupBy(
        get(routeSegment, 'stop.departures.nodes', []),
        createDepartureId
      )
      const validDepartures = filterByDateChains<JoreDeparture>(groupedDepartures, date)

      // Merge the route segment and the stop data, picking what we need from the segment and
      // splatting the stop. What we really need from the segment is the timing stop type and
      // the stop index. The departures will later be matched with actually observed events.
      return {
        destination: routeSegment.destinationFi || '',
        distanceFromPrevious: routeSegment.distanceFromPrevious,
        distanceFromStart: routeSegment.distanceFromStart,
        duration: routeSegment.duration,
        stopIndex: routeSegment.stopIndex,
        isTimingStop: !!routeSegment.timingStopType,
        ...createStopObject(get(routeSegment, 'stop', {})),
        departures: validDepartures,
      }
    }
  )

  // Departures have only one way of linking to other departures from the same journey and
  // that is the departureId. To get the departureId for this journey, we must start at
  // the first departure. Since we ordered the segments by stopIndex, the first stop is first.
  const firstStopDepartures = get(stops, '[0].departures', [])

  // The first departure of the journey is found by matching the departure time of the
  // requested journey. This is the time argument. Note that it will be given as a 24h+ time.,
  // so we also need to get a 24+ time for the departure using `getDepartureTime`.
  const originDeparture =
    firstStopDepartures.find(
      ({ hours, minutes, isNextDay }) => getDepartureTime({ hours, minutes, isNextDay }) === time
    ) || null

  if (!originDeparture) {
    return false
  }

  // With the departureId from the first departure we can easily reduce the departures on each
  // stop down to the one departure that belongs to this specific journey.
  const departures = stops.map((stop) => {
    const departure = get<StopSegmentCombo, any, []>(stop, 'departures', []).filter(
      (dep) => dep.departureId === originDeparture.departureId
    )[0] // The array should be only one element long, so get the one element out of it.

    // The departures are then converted to objects native to this domain.
    return createPlannedDepartureObject(departure, stop, date)
  })

  // Return both the route and the departures that we put so much work into parsing.
  // Note that the route is also returned as a domain object.
  return { route: createRouteObject(journeyRoute), departures }
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
 * @param instance The "instance" of the journey if it was operated with many vehicles
 */
export async function createJourneyResponse(
  fetchRouteData: () => Promise<JoreRoute | null>,
  fetchJourneyEvents: () => Promise<Vehicles[]>,
  fetchJourneyEquipment: (
    vehicleId: string | number,
    operatorId: string
  ) => Promise<JoreEquipment | null>,
  routeId: string,
  direction: Direction,
  departureDate: string,
  departureTime: string,
  // If there are many vehicles operating this journey, this argument
  // can be used to select which set of observed events to fetch.
  instance: number = 0
): Promise<Journey | null> {
  // The journey identifier used when caching various items.
  const journeyKey = createJourneyId({
    routeId,
    direction,
    departureDate,
    departureTime,
    instance,
  })

  // Fetch events, route and departures, and match events to departures.
  // Return the full journey data.
  const fetchAndProcessJourney = async (): Promise<Journey | false> => {
    let journeyEvents = await fetchValidJourneyEvents(fetchJourneyEvents)

    // There could have been many vehicles operating this journey. Separate them by
    // vehicle ID and use the instance argument to select the set of events.
    const vehicleGroups = Object.values(groupBy(journeyEvents || null, 'unique_vehicle_id'))
    journeyEvents = vehicleGroups[instance]

    // Fetch the planned departures and the route.
    const routeCacheKey = `journey_route_departures_${journeyKey}`
    const routeAndDepartures = await cacheFetch<JourneyRoute>(
      routeCacheKey,
      () => fetchJourneyDepartures(fetchRouteData, departureDate, departureTime),
      24 * 60 * 60 // Cached for 24 hours, could probably be increased since this data never changes.
    )

    // Note that we fetch and cache the route and the departures before bailing.
    if (!journeyEvents || journeyEvents.length === 0) {
      return false
    }

    const events: Vehicles[] = journeyEvents

    // Return only the events if no departures were found.
    if (!routeAndDepartures || routeAndDepartures.departures.length === 0) {
      return createJourneyObject(events, null, [], null, instance || 0)
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

    const journeyEquipment = await cacheFetch<JoreEquipment>(
      equipmentKey,
      () => fetchJourneyEquipment(vehicle_number, owner_operator_id),
      24 * 60 * 60
    )

    // Everything is baked into a Journey domain object.
    return createJourneyObject(events, route, observedDepartures, journeyEquipment, instance || 0)
  }

  // Decide a suitable TTL for the cached journey based on if the journey is completed or not.
  const getJourneyTTL = (data: Journey) => {
    const lastDeparture = data.departures[data.departures.length - 1]

    // If the last departure has observed data, we know the journey is near its end.
    if (lastDeparture && lastDeparture.observedArrivalTime) {
      const eventsLength = data.events.length
      const lastEventTime = get(data, `events[{${eventsLength - 1}].recordedAt`, 1)
      // Check the time since the last event
      const eventsEndNowDiff = differenceInSeconds(new Date(), lastEventTime)

      // If the time is more than 5 minutes, we can safely say that the journey has concluded.
      if (eventsEndNowDiff > 5 * 60) {
        return 24 * 60 * 60 // Cache for 24 hours.
      }

      // If the last stop has observed data but the event stream hasn't finished yet, cache for 5 seconds.
      return 5
    } else {
      return 1 // Cache ongoing journeys for 1 second.
    }
  }

  // Cache the full journey data by instance, so separate vehicle journeys don't get mixed.
  const journeyCacheKey = `journey_${instance}_${journeyKey}`
  const journey = await cacheFetch<Journey>(journeyCacheKey, fetchAndProcessJourney, getJourneyTTL)

  if (!journey) {
    return null
  }

  return journey
}
