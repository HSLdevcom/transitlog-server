import { groupBy, orderBy, uniqBy } from 'lodash'
import { JoreDepartureWithOrigin, JoreStopSegment } from '../types/Jore'
import { Vehicles } from '../types/generated/hfp-types'
import { Departure, Direction, RouteSegment } from '../types/generated/schema-types'
import { CachedFetcher } from '../types/CachedFetcher'
import { cacheFetch } from './cache'
import { Dictionary } from '../types/Dictionary'
import { filterByDateChains } from '../utils/filterByDateChains'
import { isToday } from 'date-fns'
import {
  combineDeparturesAndEvents,
  combineDeparturesAndStops,
  fetchEvents,
  fetchStops,
} from './createDeparturesResponse'

/*
  Departures fetched with a route identifier. The difference is in cache keys, group keys
  and it does not filter the result set.
 */

export async function createRouteDeparturesResponse(
  getDepartures: () => Promise<JoreDepartureWithOrigin[]>,
  getStops: () => Promise<JoreStopSegment[] | null>,
  getEvents: () => Promise<Vehicles[]>,
  stopId: string,
  routeId: string,
  direction: Direction,
  date: string
): Promise<Departure[]> {
  // Fetches the departures and stop data for the stop and validates them.
  const fetchDepartures: CachedFetcher<Departure[]> = async () => {
    const stopsCacheKey = `departure_stop_${stopId}_${date}`

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
      ({ hours, minutes, extra_departure, day_type }) =>
        // Careful with this group key. You want to group departures that are the same but have different
        // validity times without including any items that shouldn't be included or excluding any items
        // that should be included.
        `${hours}:${minutes}_${extra_departure}_${day_type}`
    ) as Dictionary<JoreDepartureWithOrigin[]>

    let validDepartures = filterByDateChains<JoreDepartureWithOrigin>(groupedDepartures, date)

    validDepartures = uniqBy(
      validDepartures,
      // Be careful with this unique key too. The departures are now validated,
      // but we still want to remove doubles. The key should identify distinct
      // departures and not remove any that should be included.
      ({ extra_departure, hours, minutes }) => `${hours}_${minutes}_${extra_departure}`
    )

    return combineDeparturesAndStops(validDepartures, stops, date)
  }

  const createDepartures: CachedFetcher<Departure[]> = async () => {
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
    const journeyTTL: number = isToday(date) ? 10 : 30 * 24 * 60 * 60

    const eventsCacheKey = `departure_events_${stopId}_${date}_${routeId}_${direction}`
    const departureEvents = await cacheFetch<Vehicles[]>(
      eventsCacheKey,
      () => fetchEvents(getEvents),
      journeyTTL
    )

    // We can still return planned departures without observed events.
    if (!departureEvents || departureEvents.length === 0) {
      return orderBy(departures, 'plannedDepartureTime.departureTime')
    }

    return combineDeparturesAndEvents(departures, departureEvents, date)
  }

  const departuresTTL: number = isToday(date) ? 5 * 60 : 30 * 24 * 60 * 60
  const cacheKey = `route_departures_${stopId}_${routeId}_${direction}_${date}`
  const routeDepartures = await cacheFetch<Departure[]>(cacheKey, createDepartures, departuresTTL)

  if (!routeDepartures || routeDepartures.length === 0) {
    return []
  }

  return routeDepartures
}
