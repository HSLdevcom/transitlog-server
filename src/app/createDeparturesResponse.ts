import { CachedFetcher } from '../types/CachedFetcher'
import { flatten, get, groupBy, orderBy, uniqBy } from 'lodash'
import { filterByDateChains } from '../utils/filterByDateChains'
import { JoreDepartureWithOrigin, JoreStopSegment, Mode } from '../types/Jore'
import { Departure, DepartureFilterInput, RouteSegment } from '../types/generated/schema-types'
import { Vehicles } from '../types/generated/hfp-types'
import { cacheFetch } from './cache'
import {
  createDepartureId,
  createDepartureJourneyObject,
  createPlannedDepartureObject,
} from './objects/createDepartureObject'
import { createSimpleStopObject } from './objects/createStopObject'
import { getDirection } from '../utils/getDirection'
import { getJourneyStartTime } from '../utils/time'
import { getStopDepartureData } from '../utils/getStopDepartureData'
import { filterDepartures } from './filters/filterDepartures'
import { groupEventsByInstances } from '../utils/groupEventsByInstances'
import { getStopArrivalData } from '../utils/getStopArrivalData'
import { Dictionary } from '../types/Dictionary'
import { isToday } from 'date-fns'

export async function createDeparturesResponse(
  getDepartures: () => Promise<JoreDepartureWithOrigin[]>,
  getStops: () => Promise<JoreStopSegment[] | null>,
  getEvents: () => Promise<Vehicles[]>,
  stopId: string,
  date: string,
  filters: DepartureFilterInput
) {
  // Fetch the stop which the departures are requested from.
  // Combines the stop data with route segments to end up with stop objects with route data.
  const fetchStops: CachedFetcher<RouteSegment[]> = async () => {
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
      const stop = createSimpleStopObject(segment)

      return {
        destination: segment.destination_fi || '',
        distanceFromPrevious: segment.distance_from_previous,
        distanceFromStart: segment.distance_from_start,
        duration: segment.duration,
        stopIndex: segment.stop_index,
        isTimingStop: !!segment.timing_stop_type, // very important
        lineId: get(segment, 'line_id', ''),
        originStopId: get(segment, 'originstop_id', ''),
        routeId: segment.route_id,
        direction: getDirection(segment.direction),
        mode: stop.modes[0],
        ...stop,
      }
    })
  }

  // Fetches the departures and stop data for the stop and validates them.
  const fetchDepartures: CachedFetcher<Departure[]> = async () => {
    const stopsCacheKey = `departure_stops_${stopId}_${date}`

    // Do NOT await these yet as we can fetch them in parallel.
    const stopsPromise = cacheFetch<RouteSegment[]>(stopsCacheKey, fetchStops, 24 * 60 * 60)
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
      createDepartureId
    ) as Dictionary<JoreDepartureWithOrigin[]>

    let validDepartures = filterByDateChains<JoreDepartureWithOrigin>(groupedDepartures, date)

    validDepartures = uniqBy(
      validDepartures,
      ({ route_id, direction, extra_departure, stop_id, hours, minutes }) =>
        `${route_id}_${direction}_${extra_departure}_${stop_id}_${hours}:${minutes}`
    )

    return validDepartures.map((departure) => {
      // Find a relevant stop segment and use it in the departure response.
      const stop = stops.find((stopSegment) => {
        return (
          stopSegment.routeId === departure.route_id &&
          stopSegment.direction === getDirection(departure.direction)
        )
      })

      departure.origin_departure = {
        hours: departure.origin_hours || 0,
        minutes: departure.origin_minutes || 0,
        stop_id: departure.origin_stop_id || '',
        departure_id: departure.origin_departure_id || 0,
        is_next_day: departure.origin_is_next_day || false,
        extra_departure: departure.origin_extra_departure || 'N',
        day_type: departure.day_type,
        route_id: departure.route_id,
        direction: departure.direction,
      }

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

  const eventsCacheKey = `departure_events_${stopId}_${date}`
  const departureEvents = await cacheFetch<Vehicles[]>(eventsCacheKey, fetchEvents, journeyTTL)

  // Apply the filters, if any, to the list of valid departures.
  const filteredDepartures = filterDepartures(departures, filters)

  // We can still return planned departures without observed events.
  if (!departureEvents || departureEvents.length === 0) {
    return orderBy(filteredDepartures, 'plannedDepartureTime.departureTime')
  }

  // Link observed events to departures. Events are ultimately grouped by vehicle ID
  // to separate the "instances" of the journey.
  const departuresWithEvents: Departure[][] = filteredDepartures.map((departure) => {
    const originDepartureTime = get(departure, 'originDepartureTime.departureTime', null)

    // The departures are matched to events through the "journey start time", ie the time that
    // the vehicle is planned to depart from the first stop. Thus we need the departure time
    // from the first stop for the journey that this departure belongs to in order to match
    // it with an event. If we don't have the origin departure time, we can't match the
    // departure to an event.
    if (!originDepartureTime) {
      return [departure]
    }

    // We can use info that the departure happened during "the next day" when calculating
    // the 24h+ time of the event.
    const departureIsNextDay = get(departure, 'originDepartureTime.isNextDay', false)
    const routeId = get(departure, 'routeId', '')
    const direction = getDirection(get(departure, 'direction'))

    // Match events to departures
    const eventsForDeparture = departureEvents.filter(
      (event) =>
        event.route_id === routeId &&
        getDirection(event.direction_id) === direction &&
        // All times are given as 24h+ times wherever possible, including here. Calculate 24h+ times
        // for the event to match it with the 24h+ time of the origin departure.
        getJourneyStartTime(event, departureIsNextDay) === originDepartureTime
    )

    if (!eventsForDeparture || eventsForDeparture.length === 0) {
      return [departure]
    }

    const eventsPerVehicleJourney = groupEventsByInstances(eventsForDeparture).map(
      ([_, instanceEvents]) => orderBy(instanceEvents, 'tsi', 'desc')
    )

    const firstStopId = get(departure, 'stop.originStopId', '')

    return eventsPerVehicleJourney.map((events, index, instances) => {
      const stopArrival = departure ? getStopArrivalData(events, departure, date) : null
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
        id: departure.id.slice(0, -1) + index,
        journey: departureJourney,
        observedArrivalTime: stopArrival,
        observedDepartureTime: stopDeparture,
      }
    })
  })

  return orderBy(flatten(departuresWithEvents), 'plannedDepartureTime.departureTime')
}
