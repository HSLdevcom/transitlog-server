import { CachedFetcher } from '../types/CachedFetcher'
import { compact, flatten, get, groupBy, orderBy } from 'lodash'
import { filterByDateChains } from '../utils/filterByDateChains'
import { JoreDepartureWithOrigin, JoreStopSegment, Mode } from '../types/Jore'
import {
  Departure,
  DepartureFilterInput,
  ExceptionDay,
  RouteSegment,
} from '../types/generated/schema-types'
import { cacheFetch } from '../cache'
import {
  createDepartureJourneyObject,
  createPlannedDepartureObject,
} from '../objects/createDepartureObject'
import { createStopObject } from '../objects/createStopObject'
import { getDirection } from '../utils/getDirection'
import { getJourneyStartTime } from '../utils/time'
import { getStopDepartureData } from '../utils/getStopDepartureData'
import { filterDepartures } from '../filters/filterDepartures'
import { groupEventsByInstances } from '../utils/groupEventsByInstances'
import { Dictionary } from '../types/Dictionary'
import { isToday } from 'date-fns'
import { filterByExceptions } from '../utils/filterByExceptions'
import {
  setAlertsOnDeparture,
  setCancellationsOnDeparture,
} from '../utils/setCancellationsAndAlerts'
import { Vehicles } from '../types/EventsDb'
import { requireUser } from '../auth/requireUser'
import { createOriginDeparture } from '../utils/createOriginDeparture'

/*
  Common functions for route departures and stop departures.
 */

// Fetch the stop which the departures are requested for.
// Combines the stop data with route segments to end up with stop objects with route data.
export const fetchStops: CachedFetcher<RouteSegment[]> = async (getStops, date) => {
  const stops = await getStops()

  // Return false to skip caching an empty value
  if (!stops || stops.length === 0) {
    return false
  }

  // Group route segments for validation. The segments will be validated
  // within their groups using date chain logic.
  const groupedRouteSegments = groupBy(
    stops,
    ({ route_id, direction, stop_index }) => route_id + direction + stop_index
  )

  // Validate by date chains and return only segments valid during the requested date.
  const validSegments = filterByDateChains<JoreStopSegment>(groupedRouteSegments, date)

  // Create a combo of the stop data and the route segment. The segment acts as glue between
  // the stop and the route, carrying such data as timing stop status.
  return validSegments.map((segment) => {
    const stop = createStopObject(segment)

    return {
      ...stop,
      destination: segment.destination_fi || '',
      distanceFromPrevious: segment.distance_from_previous,
      distanceFromStart: segment.distance_from_start,
      duration: segment.duration,
      stopIndex: get(segment, 'stop_index', 0) || 0,
      isTimingStop: !!segment.timing_stop_type, // very important
      originStopId: get(segment, 'originstop_id', ''),
      routeId: segment.route_id,
      direction: getDirection(segment.direction),
      mode: stop.modes[0],
      cancellations: [],
    }
  })
}

// Fetches the events for the departures. The fetch function will
// be different for stop and route departures.
export const fetchEvents: CachedFetcher<Vehicles[]> = async (getEvents) => {
  const events = await getEvents()

  if (!events || events.length === 0) {
    return false
  }

  return events
}

// Combines departures and stops into Departures.
export const combineDeparturesAndStops = (departures, stops, date): Departure[] => {
  const departuresWithStops = departures.map((departure) => {
    // Find a relevant stop segment and use it in the departure response.
    const stop = stops.find((stopSegment) => {
      return (
        stopSegment.routeId === departure.route_id &&
        stopSegment.direction === getDirection(departure.direction)
      )
    })

    if (!stop) {
      return null
    }

    departure.origin_departure = createOriginDeparture(departure)
    return createPlannedDepartureObject(departure, stop, date)
  })

  return compact(departuresWithStops)
}

export const combineDeparturesAndEvents = (departures, events, date): Departure[] => {
  // Link observed events to departures. Events are ultimately grouped by vehicle ID
  // to separate the "instances" of the journey.
  const departuresWithEvents: Departure[][] = departures.map((departure) => {
    const departureTimePath = !!departure.originDepartureTime
      ? 'originDepartureTime'
      : 'plannedDepartureTime'

    const departureTime = get(departure, departureTimePath + '.departureTime', null)

    // The departures are matched to events through the "journey start time", ie the time that
    // the vehicle is planned to depart from the first stop. Thus we need the departure time
    // from the first stop for the journey that this departure belongs to in order to match
    // it with an event. If we don't have the origin departure time, we can't match the
    // departure to an event.
    if (!departureTime) {
      return [departure]
    }

    const routeId = get(departure, 'routeId', '')
    const direction = getDirection(get(departure, 'direction'))

    // Match events to departures
    const eventsForDeparture = events.filter(
      (event) =>
        event.route_id === routeId &&
        getDirection(event.direction_id) === direction &&
        // All times are given as 24h+ times wherever possible, including here. Calculate 24h+ times
        // for the event to match it with the 24h+ time of the origin departure.
        getJourneyStartTime(event) === departureTime
    )

    if (!eventsForDeparture || eventsForDeparture.length === 0) {
      return [departure]
    }

    const eventsPerVehicleJourney = groupEventsByInstances(eventsForDeparture).map(
      ([_, instanceEvents]) => orderBy(instanceEvents, 'tsi', 'desc')
    )

    const firstStopId = get(departure, 'stop.originStopId', '')

    return eventsPerVehicleJourney.map((events, index, instances) => {
      const stopDeparture = departure ? getStopDepartureData(events, departure, date) : null

      const departureJourney = createDepartureJourneyObject(
        events[0],
        firstStopId,
        instances.length > 1 ? index + 1 : 0,
        get(departure, 'mode', Mode.Bus) as Mode
      )

      return {
        ...departure,
        id: index > 0 ? departure.id + '_' + index : departure.id,
        journey: departureJourney,
        observedArrivalTime: null,
        observedDepartureTime: stopDeparture,
      }
    })
  })

  return orderBy(flatten(departuresWithEvents), 'plannedDepartureTime.departureTime')
}

/*
  Fetch all departures for a stop. The departures are from all the routes that use the stop,
  so the group and cache keys are different from the routeDepartures function below.
  This function also filters the result with the provided filter terms.
 */

export async function createDeparturesResponse(
  user,
  getDepartures: () => Promise<JoreDepartureWithOrigin[]>,
  getStops: () => Promise<JoreStopSegment[] | null>,
  getEvents: () => Promise<Vehicles[]>,
  getCancellations,
  getAlerts,
  exceptions: ExceptionDay[],
  stopId: string,
  date: string,
  filters: DepartureFilterInput,
  skipCache: boolean = false
) {
  // Fetches the departures and stop data for the stop and validates them.
  const fetchDepartures: CachedFetcher<Departure[]> = async () => {
    const stopsCacheKey = `departure_stops_${stopId}_${date}`

    // Do NOT await these yet as we can fetch them in parallel.
    const stopsPromise = cacheFetch<RouteSegment[]>(
      stopsCacheKey,
      () => fetchStops(getStops, date),
      24 * 60 * 60
    )
    const departuresPromise = getDepartures()

    // Fetch stops and departures in parallel
    const [stops, departures] = await Promise.all([stopsPromise, departuresPromise])

    // If either of these fail, we've got nothing of value.
    // Be aware that `stops` can be falsy.
    if (!stops || stops.length === 0 || departures.length === 0) {
      return false
    }

    // Group and validate departures with date chains
    const groupedDepartures = groupBy<JoreDepartureWithOrigin>(
      departures,
      ({ departure_id, stop_id, day_type, extra_departure, route_id, direction }) =>
        `${route_id}_${direction}_${departure_id}_${stop_id}_${day_type}_${extra_departure}`
    ) as Dictionary<JoreDepartureWithOrigin[]>

    const validDepartures = filterByDateChains<JoreDepartureWithOrigin>(
      groupedDepartures,
      date
    )
    return filterByExceptions(
      combineDeparturesAndStops(validDepartures, stops, date),
      exceptions
    )
  }

  const createDepartures: CachedFetcher<Departure[]> = async () => {
    const departuresCacheKey = `departures_${stopId}_${date}`
    const departures = await cacheFetch<Departure[]>(
      departuresCacheKey,
      fetchDepartures,
      24 * 60 * 60
    )

    if (!departures || departures.length === 0) {
      return []
    }

    // Cache events for the current day for 10 seconds only.
    // Older dates can be cached for longer.
    const journeyTTL: number = isToday(date) ? 5 : 24 * 60 * 60

    const eventsCacheKey = `departure_events_${stopId}_${date}`
    const departureEvents = await cacheFetch<Vehicles[]>(
      eventsCacheKey,
      () => fetchEvents(getEvents),
      journeyTTL
    )

    const alerts = await getAlerts(date, {
      allStops: true,
      allRoutes: true,
      stop: true,
      route: true,
    })

    const cancellations = await getCancellations(date, { all: true })

    const departuresWithAlerts = departures.map((departure) => {
      setAlertsOnDeparture(departure, alerts)
      setCancellationsOnDeparture(departure, cancellations)
      return departure
    })

    // We can still return planned departures without observed events.
    if (!departureEvents || departureEvents.length === 0) {
      return orderBy(departuresWithAlerts, 'plannedDepartureTime.departureTime')
    }

    return combineDeparturesAndEvents(departuresWithAlerts, departureEvents, date)
  }

  const departuresTTL: number = isToday(date) ? 5 : 30 * 24 * 60 * 60
  const cacheKey = `stop_departures_${stopId}_${date}_${
    requireUser(user, 'HSL') ? 'HSL_authorized' : 'unauthorized'
  }`

  const departures = await cacheFetch<Departure[]>(cacheKey, createDepartures, departuresTTL)

  if (!departures || departures.length === 0) {
    return []
  }

  return filterDepartures(departures, filters)
}