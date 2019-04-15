import { CachedFetcher } from '../types/CachedFetcher'
import { Departure, RouteSegment } from '../types/generated/schema-types'
import { cacheFetch } from './cache'
import { JoreDepartureWithOrigin, Mode } from '../types/Jore'
import { Dictionary } from '../types/Dictionary'
import { filterByDateChains } from '../utils/filterByDateChains'
import { getISOWeek, isToday } from 'date-fns'
import { Vehicles } from '../types/generated/hfp-types'
import { getDirection } from '../utils/getDirection'
import {
  createDepartureJourneyObject,
  createPlannedDepartureObject,
} from './objects/createDepartureObject'
import { getJourneyStartTime } from '../utils/time'
import { groupEventsByInstances } from '../utils/groupEventsByInstances'
import { getStopArrivalData } from '../utils/getStopArrivalData'
import { getStopDepartureData } from '../utils/getStopDepartureData'
import { get, groupBy, orderBy } from 'lodash'
import { getDayTypeFromDate } from '../utils/getDayTypeFromDate'
import { fetchEvents, fetchStops } from './createDeparturesResponse'
import { PlannedDeparture } from '../types/PlannedDeparture'

const combineDeparturesAndEvents = (departures, events, date): Departure[] => {
  // Link observed events to departures. Events are ultimately grouped by vehicle ID
  // to separate the "instances" of the journey.
  const departuresWithEvents: Departure[] = departures.map((departure) => {
    const departureTime = get(departure, 'plannedDepartureTime.departureTime', null)

    // The departures are matched to events through the "journey start time", ie the time that
    // the vehicle is planned to depart from the first stop. Thus we need the departure time
    // from the first stop for the journey that this departure belongs to in order to match
    // it with an event. If we don't have the origin departure time, we can't match the
    // departure to an event.
    if (!departureTime) {
      return departure
    }

    // We can use info that the departure happened during "the next day" when calculating
    // the 24h+ time of the event.
    const departureIsNextDay = get(departure, 'plannedDepartureTime.isNextDay', false)
    const routeId = get(departure, 'routeId', '')
    const direction = getDirection(get(departure, 'direction'))
    const dayType = departure.dayType

    // Match events to departures
    const eventsForDeparture = events.filter(
      (event) =>
        event.route_id === routeId &&
        getDirection(event.direction_id) === direction &&
        // All times are given as 24h+ times wherever possible, including here. Calculate 24h+ times
        // for the event to match it with the 24h+ time of the origin departure.
        getJourneyStartTime(event, departureIsNextDay) === departureTime &&
        getDayTypeFromDate(event.oday) === dayType
    )

    if (!eventsForDeparture || eventsForDeparture.length === 0) {
      return departure
    }

    const firstJourneyEvent: Vehicles = groupEventsByInstances(eventsForDeparture).map(
      ([_, instanceEvents]) => orderBy(instanceEvents, 'tsi', 'desc')
    )[0][0]

    console.log(firstJourneyEvent)

    const firstStopId = get(departure, 'stop.originStopId', '')

    const stopArrival = departure ? getStopArrivalData(events, departure, date) : null
    const stopDeparture = departure ? getStopDepartureData(events, departure, date) : null

    const departureJourney = createDepartureJourneyObject(
      firstJourneyEvent,
      departureIsNextDay,
      firstStopId,
      0,
      get(departure, 'mode', Mode.Bus) as Mode
    )

    return {
      ...departure,
      journey: departureJourney,
      observedArrivalTime: stopArrival,
      observedDepartureTime: stopDeparture,
    }
  })

  return orderBy(departuresWithEvents, 'plannedDepartureTime.departureTime')
}

export const combineDeparturesAndStops = (departures, stops, date): PlannedDeparture[] => {
  return departures.map((departure) => {
    // Find a relevant stop segment and use it in the departure response.
    const stop = stops.find((stopSegment) => {
      return (
        stopSegment.routeId === departure.route_id &&
        stopSegment.direction === getDirection(departure.direction)
      )
    })

    return createPlannedDepartureObject(departure, stop || null, date)
  })
}

export const createWeekDeparturesResponse = async (
  getDepartures,
  getStops,
  getEvents,
  stopId,
  routeId,
  direction,
  date
) => {
  const weekNumber = getISOWeek(date)

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
    // Be aware that stops can be falsy due to being from a CachedFetcher.
    if (!stops || stops.length === 0 || departures.length === 0) {
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

    const validDepartures = filterByDateChains<JoreDepartureWithOrigin>(groupedDepartures, date)
    return combineDeparturesAndStops(validDepartures, stops, date)
  }

  const createDepartures: CachedFetcher<Departure[]> = async () => {
    const departuresCacheKey = `week_departures_${stopId}_${routeId}_${direction}_${date}`
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

    const eventsCacheKey = `departure_events_${stopId}_${weekNumber}_${routeId}_${direction}`
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

  const departuresTTL: number = 1 // isToday(date) ? 5 * 60 : 30 * 24 * 60 * 60
  const cacheKey = `week_departures_${stopId}_${routeId}_${direction}_${weekNumber}`
  const routeDepartures = await cacheFetch<Departure[]>(cacheKey, createDepartures, departuresTTL)

  if (!routeDepartures || routeDepartures.length === 0) {
    return []
  }

  return routeDepartures
}
