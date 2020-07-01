import { CachedFetcher } from '../types/CachedFetcher'
import {
  Departure,
  ExceptionDay,
  ObservedArrival,
  ObservedDeparture,
  RouteSegment,
  Scalars,
} from '../types/generated/schema-types'
import { cacheFetch } from '../cache'
import { JoreDeparture, JoreDepartureWithOrigin, JoreStopSegment, Mode } from '../types/Jore'
import { Dictionary } from '../types/Dictionary'
import { filterByDateChains } from '../utils/filterByDateChains'
import { getISOWeek, isAfter, isToday, startOfTomorrow } from 'date-fns'
import { getDirection } from '../utils/getDirection'
import {
  createDepartureJourneyObject,
  createPlannedDepartureObject,
} from '../objects/createDepartureObject'
import { getJourneyStartTime } from '../utils/time'
import { getStopDepartureData, getStopDepartureEvent } from '../utils/getStopDepartureData'
import { compact, flatten, get, groupBy, orderBy, uniq } from 'lodash'
import { dayTypes, getDayTypeFromDate } from '../utils/dayTypes'
import { fetchStops } from './createDeparturesResponse'
import { TZ } from '../constants'
import moment from 'moment-timezone'
import { groupEventsByInstances } from '../utils/groupEventsByInstances'
import { filterByExceptions } from '../utils/filterByExceptions'
import { setCancellationsOnDeparture } from '../utils/setCancellationsAndAlerts'
import { Vehicles } from '../types/EventsDb'
import { getStopArrivalData, getStopArrivalEvent } from '../utils/getStopArrivalData'
import { createOriginDeparture } from '../utils/createOriginDeparture'
import { extraDepartureType } from '../utils/extraDepartureType'
import { stop } from '../utils/knexLogger'

const combineDeparturesAndEvents = (
  departures,
  events: Vehicles[],
  lastStopArrival = false
): Departure[] => {
  // Index events by day type and journey start time, so that we don't need to filter
  // through all events on each iteration of the departures loop.
  const groupedEvents = events.reduce((eventsMap, event) => {
    const eventDayType = getDayTypeFromDate(event.oday)
    const journeyStartTime = getJourneyStartTime(event)

    if (!eventDayType || !journeyStartTime) {
      return eventsMap
    }

    const eventKey = `${eventDayType}/${journeyStartTime}`
    const eventsGroup = eventsMap[eventKey] || []

    eventsGroup.push(event)

    eventsMap[eventKey] = eventsGroup
    return eventsMap
  }, {})

  // Link observed events to departures.
  const departuresWithEvents: Departure[] = departures.map((departure) => {
    let plannedDate = ''
    let originDepartureTime = ''
    const dayType = departure?._normalDayType || departure?.dayType || ''

    if (lastStopArrival) {
      plannedDate = get(departure, 'plannedArrivalTime.arrivalDate', null)
      originDepartureTime = get(departure, 'originDepartureTime.departureTime', null)
    } else {
      // We can use info that the departure happened during "the next day" when calculating
      // the 24h+ time of the event.
      originDepartureTime = departure?.plannedDepartureTime?.departureTime || null
      plannedDate = departure?.plannedDepartureTime?.departureDate || null
    }

    // Match events to departures
    const eventsForDeparture = get(groupedEvents, `${dayType}/${originDepartureTime}`, [])

    if (!eventsForDeparture || eventsForDeparture.length === 0) {
      return departure
    }

    const eventsPerVehicleJourney = groupEventsByInstances(
      eventsForDeparture
    ).map(([_, instanceEvents]) => orderBy(instanceEvents, 'tsi', 'desc'))

    const firstStopId = get(departure, 'stop.originStopId', '')
    const firstInstanceEvents = eventsPerVehicleJourney[0]

    if (firstInstanceEvents.length === 0) {
      return departure
    }

    let eventData: ObservedArrival | ObservedDeparture | null = null
    let event: Vehicles | null = null

    // We can respond with either the departure from the origin stop or the
    // arrival to the destination stop, depending on the lastStopArrival state.
    if (departure && lastStopArrival) {
      event = getStopArrivalEvent(firstInstanceEvents)
      eventData = getStopArrivalData(event, departure, plannedDate)
    } else if (departure) {
      // Timing stops and origin stops use DEP (exit stop radius) as the
      // departure event, but normal stops use PDE (doors closed).
      const isTimingStopOrOrigin = departure.isTimingStop || !!departure.isOrigin
      event = getStopDepartureEvent(firstInstanceEvents, isTimingStopOrOrigin)
      eventData = getStopDepartureData(event, departure, plannedDate)
    }

    const eventToUse = event || firstInstanceEvents[0]

    const departureJourney = createDepartureJourneyObject(
      eventToUse,
      firstStopId,
      0,
      departure?.mode || Mode.Bus
    )

    return {
      ...departure,
      journey: departureJourney,
      observedArrivalTime: lastStopArrival ? eventData : null,
      observedDepartureTime: !lastStopArrival ? eventData : null,
    }
  })

  const orderByProp = lastStopArrival
    ? 'plannedArrivalTime.arrivalTime'
    : 'plannedDepartureTime.departureTime'

  return orderBy(departuresWithEvents, orderByProp)
}

export const combineDeparturesAndStops = (
  departures: JoreDepartureWithOrigin[],
  stops,
  exceptions: ExceptionDay[],
  date,
  lastStopArrival = false
): Departure[] => {
  const weekStart = moment.tz(date, TZ).startOf('isoWeek')

  const departuresWithStops = departures.map((departure) => {
    // Find a relevant stop segment and use it in the departure response.
    const stop = stops.find(
      (stopSegment) =>
        stopSegment.stopId === departure.stop_id &&
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

    // Get the real date of this departure from within the selected week.
    const weekDayIndex = dayTypes.indexOf(departure.day_type)

    if (weekDayIndex !== -1) {
      const normalDayTypeDate = weekStart
        .clone()
        .add(weekDayIndex, 'days')
        .format('YYYY-MM-DD')

      departureDates.push(normalDayTypeDate)
    }

    const departurePrefix = lastStopArrival
      ? 'weekly_destination_arrival'
      : 'weekly_origin_departure'

    departure.origin_departure = lastStopArrival ? createOriginDeparture(departure) : null

    return uniq(departureDates).map((departureDate) =>
      createPlannedDepartureObject(
        departure,
        stop,
        departureDate,
        departurePrefix,
        [],
        !lastStopArrival
      )
    )
  })

  const allDepartures = compact(flatten(departuresWithStops))
  return filterByExceptions(allDepartures, exceptions)
}

export const createWeekDeparturesResponse = async (
  getDepartures: () => Promise<JoreDepartureWithOrigin[]>,
  getStops: () => Promise<JoreStopSegment[] | null>,
  getEvents: (date: string) => Promise<Vehicles[]>,
  getCancellations,
  getAlerts,
  exceptions: ExceptionDay[],
  stopId: string,
  routeId: string,
  direction: Scalars['Direction'],
  date: string,
  lastStopArrival: boolean = false,
  skipCache: boolean = false
): Promise<Departure[]> => {
  const weekNumber = getISOWeek(date)

  // Fetches the departures and stop data for the stop and validates them.
  const fetchDepartures: CachedFetcher<Departure[]> = async () => {
    const stopsCacheKey = `departure_stops_${stopId}_${date}`

    // Do NOT await these yet as we can fetch them in parallel.
    const stopsPromise = cacheFetch<RouteSegment[]>(
      stopsCacheKey,
      () => fetchStops(getStops, date),
      30 * 24 * 60 * 60,
      skipCache
    )

    // Do NOT await these yet as we can fetch them in parallel.
    const departuresPromise: Promise<JoreDepartureWithOrigin[]> = getDepartures()

    // Fetch stops and departures in parallel
    const [stops, departures] = await Promise.all([stopsPromise, departuresPromise])

    // If either of these fail, we've got nothing of value.
    // Be aware that stops can be falsy due to coming from a CachedFetcher.
    if (!stops || stops.length === 0 || !departures || departures.length === 0) {
      return false
    }

    const orderByProps = lastStopArrival
      ? ['arrival_hours', 'arrival_minutes']
      : ['hours', 'minutes']

    // Group and validate departures with date chains.
    const groupedDepartures = groupBy<JoreDeparture>(
      departures,
      ({ extra_departure, day_type }) =>
        // Careful with this group key. You want to group departures that are the same but have different
        // validity times without including any items that shouldn't be included or excluding any items
        // that should be included. Duh!
        `${day_type}_${extraDepartureType(extra_departure)}`
    ) as Dictionary<JoreDeparture[]>

    const validDepartures = filterByDateChains<JoreDepartureWithOrigin>(
      groupedDepartures,
      date
    )

    return combineDeparturesAndStops(validDepartures, stops, exceptions, date, lastStopArrival)
  }

  const departuresCacheKey = `week_departures_${stopId}_${routeId}_${direction}_${weekNumber}_${
    lastStopArrival ? 'dest_arrivals' : 'orig_departures'
  }`

  const departures = await cacheFetch<Departure[]>(
    departuresCacheKey,
    fetchDepartures,
    24 * 60 * 60,
    skipCache
  )

  if (!departures || departures.length === 0) {
    return []
  }

  const minDateMoment = moment.tz(date, TZ).startOf('isoWeek')
  const requests: Array<Promise<Vehicles[] | null>> = []
  const cancellations = {}

  let i = 0

  while (i < 7) {
    const fetchMoment = minDateMoment.clone().add(i, 'day')
    const fetchDate = fetchMoment.format('YYYY-MM-DD')

    // Unnecessary to fetch dates too far into the future
    if (isAfter(fetchDate, startOfTomorrow())) {
      break
    }

    cancellations[fetchDate] = await getCancellations(
      fetchDate,
      { routeId, direction },
      skipCache
    )

    const journeyTTL: number = isToday(fetchDate) ? 5 * 60 : 24 * 60 * 60
    const eventsCacheKey = `departure_events_${stopId}_${fetchDate}_${routeId}_${direction}_${
      lastStopArrival ? 'dest_arrival' : 'orig_departure'
    }`

    const eventsPromise = cacheFetch<Vehicles[]>(
      eventsCacheKey,
      () => getEvents(fetchDate),
      journeyTTL,
      skipCache
    )

    requests.push(eventsPromise)
    i++
  }

  const departureEvents = await Promise.all(requests).then((events) =>
    flatten(events.map((dayEvents) => (!dayEvents || dayEvents.length === 0 ? [] : dayEvents)))
  )

  const processedWeekDepartures = async () => {
    let routeDepartures: Departure[] = []

    // We can still return planned departures without observed events.
    if (!departureEvents || departureEvents.length === 0) {
      routeDepartures = orderBy(departures, 'plannedDepartureTime.departureTime')
    } else {
      routeDepartures = combineDeparturesAndEvents(
        departures,
        departureEvents,
        lastStopArrival
      )
    }

    if (!routeDepartures || routeDepartures.length === 0) {
      return []
    }

    return routeDepartures.map((departure) => {
      const cancellationsForDate = cancellations[departure.departureDate] || []
      setCancellationsOnDeparture(departure, cancellationsForDate)
      return departure
    })
  }

  const weekDeparturesCacheKey = `week_departures_events_${stopId}_${routeId}_${direction}_${weekNumber}_${
    lastStopArrival ? 'dest_arrival' : 'orig_departure'
  }`

  const allWeekDepartures = await cacheFetch(
    weekDeparturesCacheKey,
    processedWeekDepartures,
    5 * 60,
    skipCache
  )

  if (!allWeekDepartures || allWeekDepartures.length === 0) {
    return []
  }

  return allWeekDepartures
}
