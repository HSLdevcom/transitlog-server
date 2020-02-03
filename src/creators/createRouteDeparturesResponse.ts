import { compact, groupBy, orderBy } from 'lodash'
import { JoreDepartureWithOrigin, JoreStopSegment } from '../types/Jore'
import {
  Departure,
  ExceptionDay,
  RouteSegment,
  Scalars,
} from '../types/generated/schema-types'
import { CachedFetcher } from '../types/CachedFetcher'
import { cacheFetch } from '../cache'
import { Dictionary } from '../types/Dictionary'
import { filterByDateChains } from '../utils/filterByDateChains'
import { isToday } from 'date-fns'
import {
  combineDeparturesAndEvents,
  fetchEvents,
  fetchStops,
} from './createDeparturesResponse'
import { getDirection } from '../utils/getDirection'
import { createPlannedDepartureObject } from '../objects/createDepartureObject'
import { filterByExceptions } from '../utils/filterByExceptions'
import { setCancellationsOnDeparture } from '../utils/setCancellationsAndAlerts'
import { Vehicles } from '../types/EventsDb'
import { extraDepartureType } from '../utils/extraDepartureType'

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

    departure.origin_departure = null
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
  direction: Scalars['Direction'],
  date: string,
  skipCache: boolean = false,
  lastStopArrival: boolean = false
): Promise<Departure[]> {
  // Fetches the departures and stop data for the stop and validates them.
  const fetchDepartures: CachedFetcher<Departure[]> = async () => {
    const stopsCacheKey = `departure_stops_${stopId}_${date}`

    // Do NOT await these yet as we can fetch them in parallel.
    const stopsPromise = cacheFetch<RouteSegment[]>(
      stopsCacheKey,
      () => fetchStops(getStops, date),
      24 * 60 * 60,
      skipCache
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
        `${departure_id}_${day_type}_${extraDepartureType(extra_departure)}`
    ) as Dictionary<JoreDepartureWithOrigin[]>

    const validDepartures = filterByDateChains<JoreDepartureWithOrigin>(
      groupedDepartures,
      date
    )

    const routeDepartures = combineDeparturesAndStops(validDepartures, stops, date)
    return filterByExceptions(routeDepartures, exceptions)
  }

  // The departures fetcher uses the route and direction in the query, so we need to
  // include them in the cache key too.
  const departuresCacheKey = `departures_${stopId}_${routeId}_${direction}_${date}`
  const departures = await cacheFetch<Departure[]>(
    departuresCacheKey,
    fetchDepartures,
    24 * 60 * 60,
    skipCache
  )

  if (!departures || departures.length === 0) {
    return []
  }

  // Cache events for the current day for 5 seconds only.
  // Older dates can be cached for longer.
  const journeyTTL: number = isToday(date) ? 60 : 24 * 60 * 60

  // The departure events are fetched with the route and direction so they need to be
  // included in the cache key.
  const eventsCacheKey = `departure_events_${stopId}_${date}_${routeId}_${direction}_${
    lastStopArrival ? 'dest_arrival' : 'orig_departure'
  }`

  const departureEvents = await cacheFetch<Vehicles[]>(
    eventsCacheKey,
    () => fetchEvents(getEvents),
    journeyTTL,
    skipCache
  )

  const cancellations = await getCancellations(date, { routeId, direction }, skipCache)

  const departuresWithCancellations = departures.map((departure) => {
    setCancellationsOnDeparture(departure, cancellations)
    return departure
  })

  // We can still return planned departures without observed events.
  if (!departureEvents || departureEvents.length === 0) {
    return orderBy(departuresWithCancellations, 'plannedDepartureTime.departureTime')
  }

  const routeDepartures = combineDeparturesAndEvents(
    departuresWithCancellations,
    departureEvents,
    date
  )

  if (!routeDepartures || routeDepartures.length === 0) {
    return []
  }

  return routeDepartures
}
