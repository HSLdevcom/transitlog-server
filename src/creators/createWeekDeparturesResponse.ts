import { CachedFetcher } from '../types/CachedFetcher'
import {
  Departure,
  Direction,
  ExceptionDay,
  ObservedArrival,
  ObservedDeparture,
  RouteSegment,
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
import { getStopDepartureData } from '../utils/getStopDepartureData'
import { compact, flatten, get, groupBy, orderBy, uniq } from 'lodash'
import { dayTypes, getDayTypeFromDate } from '../utils/dayTypes'
import { fetchStops } from './createDeparturesResponse'
import { TZ } from '../constants'
import moment from 'moment-timezone'
import { groupEventsByInstances } from '../utils/groupEventsByInstances'
import { filterByExceptions } from '../utils/filterByExceptions'
import {
  setAlertsOnDeparture,
  setCancellationsOnDeparture,
} from '../utils/setCancellationsAndAlerts'
import { Vehicles } from '../types/EventsDb'
import { getStopArrivalData } from '../utils/getStopArrivalData'
import { createOriginDeparture } from '../utils/createOriginDeparture'

const combineDeparturesAndEvents = (
  departures,
  events: Vehicles[],
  lastStopArrival = false
): Departure[] => {
  // Link observed events to departures.
  const departuresWithEvents: Departure[] = departures.map((departure) => {
    let plannedDate = ''
    let originDepartureTime = ''

    const routeId = get(departure, 'routeId', '')
    const direction = getDirection(get(departure, 'direction'))
    const dayType = get(departure, 'dayType', '')

    if (lastStopArrival) {
      plannedDate = get(departure, 'plannedArrivalTime.arrivalDate', null)
      originDepartureTime = get(departure, 'originDepartureTime.departureTime', null)
    } else {
      // We can use info that the departure happened during "the next day" when calculating
      // the 24h+ time of the event.
      originDepartureTime = get(departure, 'plannedDepartureTime.departureTime', null)
      plannedDate = get(departure, 'plannedDepartureTime.departureDate', null)
    }

    // Match events to departures
    const eventsForDeparture = events.filter(
      (event) =>
        event.route_id === routeId &&
        getDirection(event.direction_id) === direction &&
        // All times are given as 24h+ times wherever possible, including here. Calculate 24h+ times
        // for the event to match it with the 24h+ time of the origin departure.
        getJourneyStartTime(event) === originDepartureTime &&
        (getDayTypeFromDate(event.oday) === dayType || event.oday === plannedDate)
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

    let eventData: ObservedArrival | ObservedDeparture | null = null

    // We can respond with either the departure from the origin stop or the
    // arrival to the destination stop, depending on the lastStopArrival state.
    if (departure && lastStopArrival) {
      eventData = getStopArrivalData(firstInstanceEvents, departure, plannedDate)
    } else if (departure) {
      eventData = getStopDepartureData(firstInstanceEvents, departure, plannedDate)
    }

    const departureJourney = createDepartureJourneyObject(
      firstInstanceEvents,
      firstStopId,
      0,
      get(departure, 'mode', Mode.Bus) as Mode
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

    departure.origin_departure = createOriginDeparture(departure)

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
  direction: Direction,
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
      30 * 24 * 60 * 60
    )

    const departuresPromise: Promise<JoreDepartureWithOrigin[]> = getDepartures()

    // Fetch stops and departures in parallel
    const [stops, departures] = await Promise.all([stopsPromise, departuresPromise])

    // If either of these fail, we've got nothing of value.
    // Be aware that stops can be falsy due to coming from a CachedFetcher.
    if (!stops || stops.length === 0 || departures.length === 0) {
      return false
    }

    const orderByProps = lastStopArrival
      ? ['arrival_hours', 'arrival_minutes']
      : ['hours', 'minutes']

    const orderedDepartures = orderBy(departures, orderByProps, 'asc')

    // Group and validate departures with date chains.
    const groupedDepartures = groupBy<JoreDeparture>(
      orderedDepartures,
      ({ departure_id, extra_departure, day_type }) =>
        // Careful with this group key. You want to group departures that are the same but have different
        // validity times without including any items that shouldn't be included or excluding any items
        // that should be included. Duh!
        `${departure_id}_${extra_departure}_${day_type}`
    ) as Dictionary<JoreDeparture[]>

    const validDepartures = filterByDateChains<JoreDepartureWithOrigin>(
      groupedDepartures,
      date
    )
    return combineDeparturesAndStops(validDepartures, stops, exceptions, date, lastStopArrival)
  }

  const departuresCacheKey = `week_departures_${stopId}_${routeId}_${direction}_${weekNumber}_${
    lastStopArrival ? 'dest_arrival' : 'orig_departure'
  }`

  const departures = await cacheFetch<Departure[]>(
    departuresCacheKey,
    fetchDepartures,
    24 * 60 * 60
  )

  if (!departures || departures.length === 0) {
    return []
  }

  const minDateMoment = moment.tz(date, TZ).startOf('isoWeek')
  const requests: Array<Promise<Vehicles[] | null>> = []

  let i = 0

  while (i < 7) {
    const fetchMoment = minDateMoment.clone().add(i, 'day')
    const fetchDate = fetchMoment.format('YYYY-MM-DD')

    // Unnecessary to fetch dates too far into the future
    if (isAfter(fetchDate, startOfTomorrow())) {
      break
    }

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

    const alerts = await getAlerts(date, {
      allStops: true,
      allRoutes: true,
      stop: stopId,
      route: routeId,
    })

    const cancellations = await getCancellations(date, { routeId, direction })

    return routeDepartures.map((departure) => {
      setAlertsOnDeparture(departure, alerts)
      setCancellationsOnDeparture(departure, cancellations)
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