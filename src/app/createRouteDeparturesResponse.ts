import { compact, flatten, get, groupBy, orderBy } from 'lodash'
import { JoreDepartureWithOrigin, JoreStopSegment, Mode } from '../types/Jore'
import {
  Departure,
  Direction,
  ExceptionDay,
  RouteSegment,
} from '../types/generated/schema-types'
import { CachedFetcher } from '../types/CachedFetcher'
import { cacheFetch } from './cache'
import { Dictionary } from '../types/Dictionary'
import { filterByDateChains } from '../utils/filterByDateChains'
import { isToday } from 'date-fns'
import { fetchEvents, fetchStops } from './createDeparturesResponse'
import { getDirection } from '../utils/getDirection'
import {
  createDepartureJourneyObject,
  createPlannedDepartureObject,
} from './objects/createDepartureObject'
import { getJourneyStartTime } from '../utils/time'
import { groupEventsByInstances } from '../utils/groupEventsByInstances'
import { getStopDepartureData } from '../utils/getStopDepartureData'
import { filterByExceptions } from '../utils/filterByExceptions'
import {
  setAlertsOnDeparture,
  setCancellationsOnDeparture,
} from '../utils/setCancellationsAndAlerts'
import { Vehicles } from '../types/EventsDb'
import { requireUser } from '../auth/requireUser'

const combineDeparturesAndEvents = (departures, events, date): Departure[] => {
  // Link observed events to departures. Events are ultimately grouped by vehicle ID
  // to separate the "instances" of the journey.
  const departuresWithEvents: Departure[][] = departures.map((departure) => {
    const plannedDepartureTime = get(departure, 'plannedDepartureTime.departureTime', null)

    // The departures are matched to events through the "journey start time", ie the time that
    // the vehicle is planned to depart from the first stop. Thus we need the departure time
    // from the first stop for the journey that this departure belongs to in order to match
    // it with an event. If we don't have the origin departure time, we can't match the
    // departure to an event.
    if (!plannedDepartureTime) {
      return [departure]
    }

    // We can use info that the departure happened during "the next day" when calculating
    // the 24h+ time of the event.
    const departureIsNextDay = get(departure, 'plannedDepartureTime.isNextDay', false)
    const routeId = get(departure, 'routeId', '')
    const direction = getDirection(get(departure, 'direction'))

    // Match events to departures
    const eventsForDeparture = events.filter(
      (event) =>
        event.route_id === routeId &&
        getDirection(event.direction_id) === direction &&
        // All times are given as 24h+ times wherever possible, including here. Calculate 24h+ times
        // for the event to match it with the 24h+ time of the origin departure.
        getJourneyStartTime(event) === plannedDepartureTime
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
        departureIsNextDay,
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

// Combines departures and stops into PlannedDepartures.
export const combineDeparturesAndStops = (departures, stops, date): Departure[] => {
  const departuresAndStops = departures.map((departure) => {
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

    return createPlannedDepartureObject(departure, stop, date, 'route')
  })

  return compact(departuresAndStops)
}

/*
  Departures fetched with a route identifier. The difference is in cache keys, group keys
  and it does not filter the result set.
 */

export async function createRouteDeparturesResponse(
  user,
  getDepartures: () => Promise<JoreDepartureWithOrigin[]>,
  getStops: () => Promise<JoreStopSegment[] | null>,
  getEvents: () => Promise<Vehicles[]>,
  getCancellations,
  getAlerts,
  exceptions: ExceptionDay[],
  stopId: string,
  routeId: string,
  direction: Direction,
  date: string
): Promise<Departure[]> {
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
    if (!stops || !departures || stops.length === 0 || departures.length === 0) {
      return false
    }

    // Group and validate departures with date chains.
    const groupedDepartures = groupBy<JoreDepartureWithOrigin>(
      departures,
      ({ departure_id, day_type, extra_departure }) =>
        `${departure_id}_${day_type}_${extra_departure}`
    ) as Dictionary<JoreDepartureWithOrigin[]>

    const validDepartures = filterByDateChains<JoreDepartureWithOrigin>(
      groupedDepartures,
      date
    )

    const routeDepartures = combineDeparturesAndStops(validDepartures, stops, date)
    return filterByExceptions(routeDepartures, exceptions)
  }

  const createDepartures: CachedFetcher<Departure[]> = async () => {
    // The departures fetcher uses the route and direction in the query, so we need to
    // include them in the cache key too.
    const departuresCacheKey = `departures_${stopId}_${routeId}_${direction}_${date}`
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

    // The departure events are fetched with the route and direction so they need to be
    // included in the cache key.
    const eventsCacheKey = `departure_events_${stopId}_${date}_${routeId}_${direction}`
    const departureEvents = await cacheFetch<Vehicles[]>(
      eventsCacheKey,
      () => fetchEvents(getEvents),
      journeyTTL
    )

    const alerts = await getAlerts(date, {
      allStops: true,
      allRoutes: true,
      stop: stopId,
      route: routeId,
    })

    const cancellations = await getCancellations(date, { routeId, direction })

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
  const cacheKey = `route_departures_${stopId}_${routeId}_${direction}_${date}_${
    requireUser(user, 'HSL') ? 'HSL_authorized' : 'unauthorized'
  }`

  const routeDepartures = await cacheFetch<Departure[]>(
    cacheKey,
    createDepartures,
    departuresTTL
  )

  if (!routeDepartures || routeDepartures.length === 0) {
    return []
  }

  return routeDepartures
}
