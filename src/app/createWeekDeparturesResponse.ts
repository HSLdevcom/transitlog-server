import { CachedFetcher } from '../types/CachedFetcher'
import { Departure, ExceptionDay, RouteSegment } from '../types/generated/schema-types'
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
import { get, groupBy, orderBy, compact, uniq, flatten, difference } from 'lodash'
import { dayTypes, getDayTypeFromDate } from '../utils/dayTypes'
import { fetchEvents, fetchStops } from './createDeparturesResponse'
import { TZ } from '../constants'
import moment from 'moment-timezone'
import { groupEventsByInstances } from '../utils/groupEventsByInstances'
import { filterByExceptions } from '../utils/filterByExceptions'

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

    const eventsPerVehicleJourney = groupEventsByInstances(eventsForDeparture).map(
      ([_, instanceEvents]) => orderBy(instanceEvents, 'tsi', 'desc')
    )

    const firstStopId = get(departure, 'stop.originStopId', '')
    const firstInstanceEvents = eventsPerVehicleJourney[0]

    if (firstInstanceEvents.length === 0) {
      return departure
    }

    const stopDeparture = departure
      ? getStopDepartureData(firstInstanceEvents, departure, departureDate)
      : null

    const departureJourney = createDepartureJourneyObject(
      firstInstanceEvents,
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
  exceptions: ExceptionDay[],
  date
): Departure[] => {
  const weekStart = moment.tz(date, TZ).startOf('isoWeek')

  const departuresWithStops = departures.map((departure) => {
    // Find a relevant stop segment and use it in the departure response.
    const stop = stops.find(
      (stopSegment) =>
        stopSegment.routeId === departure.route_id &&
        stopSegment.direction === getDirection(departure.direction)
    )

    if (!stop) {
      return [null]
    }

    const departureDates = exceptions
      .filter(({ effectiveDayTypes }) => effectiveDayTypes.includes(departure.day_type))
      .map(({ exceptionDate }) => exceptionDate)

    const dayTypeHasException = exceptions
      .map(({ dayType }) => dayType)
      .includes(departure.day_type)

    if (departureDates.length === 0 && dayTypeHasException) {
      return [null]
    }

    if (!dayTypeHasException) {
      // Get the real date of this departure from within the selected week.
      const weekDayIndex = dayTypes.indexOf(departure.day_type)

      if (weekDayIndex !== -1) {
        const normalDayTypeDate = weekStart
          .clone()
          .add(weekDayIndex, 'days')
          .format('YYYY-MM-DD')

        departureDates.push(normalDayTypeDate)
      }
    }

    return uniq(departureDates).map((departureDate) =>
      createPlannedDepartureObject(departure, stop, departureDate, 'weekly')
    )
  })

  const allDepartures = compact(flatten(departuresWithStops))
  return filterByExceptions(allDepartures, exceptions)
}

export const createWeekDeparturesResponse = async (
  getDepartures,
  getStops,
  getEvents,
  exceptions,
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
      ({ departure_id, extra_departure, day_type }) =>
        // Careful with this group key. You want to group departures that are the same but have different
        // validity times without including any items that shouldn't be included or excluding any items
        // that should be included.
        `${departure_id}_${extra_departure}_${day_type}`
    ) as Dictionary<JoreDepartureWithOrigin[]>

    const validDepartures = filterByDateChains<JoreDepartureWithOrigin>(groupedDepartures, date)
    return combineDeparturesAndStops(validDepartures, stops, exceptions, date)
  }

  const createDepartures: CachedFetcher<Departure[]> = async () => {
    const departuresCacheKey = `week_departures_${stopId}_${routeId}_${direction}_${weekNumber}`
    const departures = await cacheFetch<Departure[]>(
      departuresCacheKey,
      fetchDepartures,
      24 * 60 * 60
    )

    if (!departures || departures.length === 0) {
      return []
    }

    const journeyTTL: number = 60
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
