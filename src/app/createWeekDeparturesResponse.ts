import { CachedFetcher } from '../types/CachedFetcher'
import { Departure, RouteSegment } from '../types/generated/schema-types'
import { cacheFetch } from './cache'
import { JoreDeparture, JoreDepartureWithOrigin, Mode } from '../types/Jore'
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
import { getStopDepartureData } from '../utils/getStopDepartureData'
import { get, groupBy, orderBy } from 'lodash'
import { dayTypes, getDayTypeFromDate } from '../utils/dayTypes'
import { fetchEvents, fetchStops } from './createDeparturesResponse'
import { PlannedDeparture } from '../types/PlannedDeparture'
import { TZ } from '../constants'
import moment from 'moment-timezone'

const combineDeparturesAndEvents = (departures, events): Departure[] => {
  // Link observed events to departures.
  const departuresWithEvents: Departure[] = departures.map((departure) => {
    const departureTime = get(departure, 'plannedDepartureTime.departureTime', null)
    const departureDate = get(departure, 'plannedDepartureTime.departureDate', null)

    // We can use info that the departure happened during "the next day" when calculating
    // the 24h+ time of the event.
    const departureIsNextDay = get(departure, 'plannedDepartureTime.isNextDay', false)
    const routeId = get(departure, 'routeId', '')
    const direction = getDirection(get(departure, 'direction'))
    const dayType = get(departure, 'dayType', '')

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

    const firstStopId = get(departure, 'stop.originStopId', '')
    const stopDeparture = departure
      ? getStopDepartureData(eventsForDeparture, departure, departureDate)
      : null

    const departureJourney = createDepartureJourneyObject(
      orderBy(eventsForDeparture, 'tsi')[0],
      departureIsNextDay,
      firstStopId,
      0,
      get(departure, 'mode', Mode.Bus) as Mode
    )

    return {
      ...departure,
      journey: departureJourney,
      observedArrivalTime: null,
      observedDepartureTime: stopDeparture,
    }
  })

  return orderBy(departuresWithEvents, 'plannedDepartureTime.departureTime')
}

export const combineDeparturesAndStops = (
  departures: JoreDeparture[],
  stops,
  date
): PlannedDeparture[] => {
  const weekStart = moment.tz(date, TZ).startOf('isoWeek')

  return departures.map((departure) => {
    // Get the real date of this departure from within the selected week.
    const weekDayIndex = dayTypes.indexOf(departure.day_type)

    const departureDate = weekStart
      .clone()
      .add(weekDayIndex, 'days')
      .format('YYYY-MM-DD')

    // Find a relevant stop segment and use it in the departure response.
    const stop = stops.find((stopSegment) => {
      return (
        stopSegment.routeId === departure.route_id &&
        stopSegment.direction === getDirection(departure.direction)
      )
    })

    return createPlannedDepartureObject(departure, stop || null, departureDate)
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

    return combineDeparturesAndEvents(departures, departureEvents)
  }

  // Cache for 5 minutes
  const departuresTTL: number = 5 * 60
  const cacheKey = `week_departures_${stopId}_${routeId}_${direction}_${weekNumber}`
  const routeDepartures = await cacheFetch<Departure[]>(cacheKey, createDepartures, departuresTTL)

  if (!routeDepartures || routeDepartures.length === 0) {
    return []
  }

  return routeDepartures
}
