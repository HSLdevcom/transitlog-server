import { CachedFetcher } from '../types/CachedFetcher'
import { get, groupBy, orderBy } from 'lodash'
import { filterByDateChains } from '../utils/filterByDateChains'
import {
  Departure as JoreDeparture,
  RouteSegment as JoreRouteSegment,
  Stop as JoreStop,
} from '../types/generated/jore-types'
import { Departure, DepartureFilterInput, DepartureStop } from '../types/generated/schema-types'
import { Vehicles } from '../types/generated/hfp-types'
import { cacheFetch } from './cache'
import { createDepartureId, createPlannedDepartureObject } from './objects/createDepartureObject'
import { createStopObject } from './objects/createStopObject'
import { getDirection } from '../utils/getDirection'
import { getDepartureTime, getJourneyStartTime } from '../utils/time'
import { getStopDepartureData } from '../utils/getStopDepartureData'
import { filterDepartures } from './filters/filterDepartures'
import { isToday } from 'date-fns'

export async function createDeparturesResponse(
  getDepartures: () => Promise<JoreDeparture | null>,
  getStop: () => Promise<JoreStop | null>,
  getEvents: () => Promise<Vehicles[]>,
  stopId: string,
  date: string,
  filters: DepartureFilterInput
) {
  // Fetch the stop which the departures are requested from.
  // Combines the stop data with route segments to end up with stop objects with route data.
  const fetchStops: CachedFetcher<DepartureStop[]> = async () => {
    const stop = await getStop()

    // Return false to sip caching an empty value
    if (!stop) {
      return false
    }

    const stopObject = createStopObject(stop)

    // Group route segments for validation. The segments will be validated within their groups
    // according to date chain logic.
    // TODO: make sure this works for problematic routes that want the grouping done by stopId instead of stopIndex.
    const groupedRouteSegments = groupBy(
      get(stop, 'routeSegments.nodes', []),
      (segment) => segment.routeId + segment.direction + segment.stopIndex
    )

    // Validate by date chains and return only segments valid during the requested date.
    const validSegments = filterByDateChains<JoreRouteSegment>(groupedRouteSegments, date)

    // Create a combo of the stop data and the route segment. The segment acts as glue between
    // the stop and the route, carrying such data as timing stop status.
    return validSegments.map((segment) => ({
      destination: segment.destinationFi || '',
      distanceFromPrevious: segment.distanceFromPrevious,
      distanceFromStart: segment.distanceFromStart,
      duration: segment.duration,
      stopIndex: segment.stopIndex,
      isTimingStop: !!segment.timingStopType, // very important
      routeId: segment.routeId,
      direction: getDirection(segment.direction),
      ...stopObject,
    }))
  }

  // Fetches the departures and stop data for the stop and validates them.
  const fetchDepartures: CachedFetcher<Departure[]> = async () => {
    // Do NOT await these yet as we can fetch them in parallel.
    const stopsPromise = fetchStops()
    const departuresPromise = getDepartures()

    // Fetch stops and departures in parallel
    const [stops, departures] = await Promise.all([stopsPromise, departuresPromise])

    // If either of these fail, we've got nothing of value.
    if (!stops || !departures) {
      return false
    }

    // Group and validate departures with date chains
    const groupedDepartures = groupBy(departures, createDepartureId)
    const validDepartures = filterByDateChains<JoreDeparture>(groupedDepartures, date)

    return validDepartures.map((departure) => {
      // Find a relevant stop segment and use it in the departure response.
      const stop = stops.find((stopSegment) => {
        return (
          stopSegment.routeId === departure.routeId &&
          stopSegment.direction === getDirection(departure.direction)
        )
      })

      return createPlannedDepartureObject(departure, stop || null, date)
    })
  }

  // Fetches the events for the departures. All events for the stop and date is fetched at once,
  // and linked to departures later.
  const fetchEvents: CachedFetcher<Vehicles[]> = async () => {
    const events = await getEvents()

    if (!events || events.length === 0) {
      return false
    }

    return events
  }

  const departuresCacheKey = `departures_${stopId}_${date}`
  const validDepartures = await cacheFetch<Departure[]>(
    departuresCacheKey,
    fetchDepartures,
    24 * 60 * 60
  )

  if (!validDepartures) {
    return []
  }

  // Cache events for the current day for 10 seconds only.
  // Older dates can be cached for longer.
  const journeyTTL: number = isToday(date) ? 10 : 24 * 60 * 60

  const eventsCacheKey = `departure_events_${stopId}_${date}`
  const departureEvents = await cacheFetch<Vehicles[]>(eventsCacheKey, fetchEvents, journeyTTL)

  // Apply the filters, if any, to the list of valid departures.
  const filteredDepartures = filterDepartures(validDepartures, filters)

  // We can still return planned departures without observed events.
  if (!departureEvents || departureEvents.length === 0) {
    return filteredDepartures
  }

  // Link observed events to departures
  return filteredDepartures.map((departure) => {
    const originDepartureTime = get(departure, 'originDepartureTime.departureTime', null)

    // The departures are matched to events through the "journey start time", ie the time that
    // the vehicle is planned to depart from the first stop. Thus we need the departure time
    // from the first stop for the journey that this departure belongs to in order to match
    // it with an event. If we don't have the origin departure time, we can't match the
    // departure to an event.
    if (!originDepartureTime) {
      return departure
    }

    // We can use info that the departure happened during "the next day" when calculating
    // the 24h+ time of the event.
    const departureIsNextDay = get(departure, 'originDepartureTime.isNextDay', false)
    const routeId = get(departure, 'routeId', '')
    const direction = parseInt(get(departure, 'direction', '0'), 10)

    // Match events to departures
    const eventsForDeparture = departureEvents.filter(
      (event) =>
        event.route_id === routeId &&
        event.direction_id === direction &&
        // All times are given as 24h+ times wherever possible, including here. Calculate 24h+ times
        // for the event to match it with the 24h+ time of the origin departure.
        getJourneyStartTime(event, departureIsNextDay) === originDepartureTime
    )

    // Calculate the observed times for the stop using the event.
    const stopDeparture = departure
      ? getStopDepartureData(orderBy(eventsForDeparture, 'tsi', 'desc'), departure, date)
      : null

    return {
      ...departure,
      observedDepartureTime: stopDeparture,
    }
  })
}
