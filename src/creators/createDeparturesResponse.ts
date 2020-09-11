import { CachedFetcher } from '../types/CachedFetcher'
import { flatten, get, groupBy, orderBy } from 'lodash'
import { filterGroupsByDate } from '../utils/filterGroupsByDate'
import { JoreDepartureWithOrigin, Mode } from '../types/Jore'
import { Departure, DepartureFilterInput, ExceptionDay } from '../types/generated/schema-types'
import { cacheFetch } from '../cache'
import {
  createDepartureJourneyObject,
  createPlannedDepartureObject,
} from '../objects/createDepartureObject'
import { getDirection } from '../utils/getDirection'
import { getJourneyStartTime } from '../utils/time'
import { getStopDepartureData, getStopDepartureEvent } from '../utils/getStopDepartureData'
import { filterDepartures } from '../filters/filterDepartures'
import { groupEventsByInstances } from '../utils/groupEventsByInstances'
import { Dictionary } from '../types/Dictionary'
import { isToday } from 'date-fns'
import { filterByExceptions } from '../utils/filterByExceptions'
import { setCancellationsOnDeparture } from '../utils/setCancellationsAndAlerts'
import { Vehicles } from '../types/EventsDb'
import { createOriginDeparture } from '../utils/createOriginDeparture'
import { removeUnauthorizedData } from '../auth/removeUnauthorizedData'
import { extraDepartureType } from '../utils/extraDepartureType'
import { getDayTypeFromDate } from '../utils/dayTypes'

// Fetches the events for the departures. The fetch function will
// be different for stop and route departures.
export const fetchEvents: CachedFetcher<Vehicles[]> = async (getEvents, stopIds) => {
  const events = await getEvents(stopIds)

  if (!events || events.length === 0) {
    return false
  }

  return events
}

// Creates Departures from JoreDepartures
export const createDepartures = (departures: JoreDepartureWithOrigin[], date): Departure[] => {
  return departures.map((departure) => {
    departure.origin_departure = createOriginDeparture(departure)
    return createPlannedDepartureObject(departure, date, 'stop')
  })
}

// Link observed events to departures. Events are ultimately grouped by vehicle ID
// to separate the "instances" of the journey.
export const combineDeparturesAndEvents = (
  departures: Departure[],
  events,
  date,
  exceptions?: ExceptionDay[]
): Departure[] => {
  // Index events by day type and journey start time, so that we don't need to filter
  // through all events on each iteration of the departures loop.
  const groupedEvents = events.reduce((eventsMap, event) => {
    const eventDayType = getDayTypeFromDate(event.oday, exceptions)
    const journeyStartTime = getJourneyStartTime(event)

    const routeId = event.route_id

    if (!eventDayType || !journeyStartTime) {
      return eventsMap
    }

    const eventKey = `${eventDayType}/${routeId}/${event.direction_id}/${journeyStartTime}`
    const eventsGroup = eventsMap[eventKey] || []

    eventsGroup.push(event)

    eventsMap[eventKey] = eventsGroup
    return eventsMap
  }, {})

  let orderedDepartures = orderBy(departures, 'plannedDepartureTime.departureTime')

  const departuresWithEvents: Departure[][] = orderedDepartures.map((departure) => {
    const departureTimePath = !!departure.originDepartureTime
      ? 'originDepartureTime'
      : 'plannedDepartureTime'

    const departureTime = get(departure, departureTimePath + '.departureTime', null)

    // The departures are matched to events through the "journey start time", ie the time that
    // the vehicle is planned to depart from the first stop. Thus we need the departure time
    // from the first stop for the journey that this departure belongs to in order to match
    // it with an event. If we don't have the origin departure time, we can't match the
    // departure to an event.
    if (!departureTime) {
      return [departure]
    }

    const dayType = departure?._normalDayType || departure?.dayType || ''
    const routeId = departure?.routeId || ''
    const direction = getDirection(departure?.direction || '')

    let eventKey = `${dayType}/${routeId}/${direction}/${departureTime}`

    // Match events to departures
    const eventsForDeparture = groupedEvents[eventKey] || []

    if (!eventsForDeparture || eventsForDeparture.length === 0) {
      return [departure]
    }

    const eventsPerVehicleJourney = groupEventsByInstances(
      eventsForDeparture
    ).map(([_, instanceEvents]) => orderBy(instanceEvents, 'tsi', 'desc'))

    const firstStopId = get(departure, 'stop.originStopId', '')

    return eventsPerVehicleJourney.map((events, index, instances) => {
      // Timing stops and origin stops use DEP (exit stop radius) as the
      // departure event, but normal stops use PDE (doors closed).
      const isTimingStopOrOrigin = departure.isTimingStop || !!departure.isOrigin
      const departureEvent = getStopDepartureEvent(events, isTimingStopOrOrigin)

      const stopDeparture = departure
        ? getStopDepartureData(departureEvent, departure, date)
        : null

      const departureJourney = createDepartureJourneyObject(
        departureEvent,
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

  return flatten(departuresWithEvents)
}

/*
  Fetch all departures for a stop. The departures are from all the routes that use the stop,
  so the group and cache keys are different from the routeDepartures function below.
  This function also filters the result with the provided filter terms.
 */

export async function createDeparturesResponse(
  getDepartures: (fetchStops: string[]) => Promise<JoreDepartureWithOrigin[]>,
  getTerminals: () => Promise<string[]>,
  getEvents: (stopIds: string[]) => Promise<Vehicles[]>,
  getCancellations,
  getAlerts,
  exceptions: ExceptionDay[],
  stopId: string,
  terminalId: string,
  date: string,
  filters: DepartureFilterInput,
  user,
  skipCache: boolean = false
) {
  const fetchTarget = terminalId ? 'terminal' : 'stop'
  const fetchTargetId = fetchTarget === 'terminal' ? terminalId : stopId

  // Fetches the departures and stop data for the stop and validates them.
  const fetchDepartures: CachedFetcher<Departure[]> = async (stopIds) => {
    let departures = await getDepartures(stopIds)

    // If either of these fail, we've got nothing of value.
    if (!departures || departures.length === 0) {
      return false
    }

    // Group and validate departures with date chains
    const groupedDepartures = groupBy<JoreDepartureWithOrigin>(
      departures,
      ({ origin_stop_id, day_type, extra_departure, route_id, direction }) =>
        `${route_id}_${direction}_${origin_stop_id}_${day_type}_${extraDepartureType(
          extra_departure
        )}`
    ) as Dictionary<JoreDepartureWithOrigin[]>

    const validDepartures = filterGroupsByDate<JoreDepartureWithOrigin>(
      groupedDepartures,
      date
    )

    // Additional filtering for doubles since they can exist in terminal departure queries.
    // Each departure is identified by the departure time from the first stop.
    const uniqueDepartureGroups = groupBy(
      validDepartures,
      ({ stop_id, day_type, extra_departure, route_id, direction, hours, minutes }) =>
        `${route_id}_${direction}_${stop_id}_${day_type}_${hours}_${minutes}_${extraDepartureType(
          extra_departure
        )}`
    )

    const uniqueDepartures: JoreDepartureWithOrigin[] = Object.values(
      uniqueDepartureGroups
    ).map((departureGroup: JoreDepartureWithOrigin[]) => {
      // Get the most recently updated departure by sorting by the date info we have.
      const orderedGroup = orderBy(departureGroup, 'date_begin', 'desc')
      return orderedGroup[0]
    })

    return filterByExceptions(createDepartures(uniqueDepartures, date), exceptions)
  }

  let stops: string[] = []

  if (fetchTarget === 'terminal') {
    const terminalsCacheKey = `departure_terminal_stops_${terminalId}_${date}`
    const terminalStops = await cacheFetch<string[]>(
      terminalsCacheKey,
      async () => {
        const terminals = await getTerminals()

        if (!terminals || terminals.length === 0) {
          return false
        }

        return terminals
      },
      30 * 24 * 60 * 60,
      skipCache
    )

    if (!terminalStops || terminalStops.length === 0) {
      return []
    }

    stops = terminalStops
  } else {
    stops = [stopId]
  }

  // Fetch planned departures and departure events simultaneously.
  const departuresCacheKey = `departures_${fetchTarget}_${fetchTargetId}_${date}`
  const departures = await cacheFetch<Departure[]>(
    departuresCacheKey,
    () => fetchDepartures(stops),
    24 * 60 * 60,
    skipCache
  )

  if (!departures || departures.length === 0) {
    return []
  }

  // Cache events for the current day for 10 seconds only.
  // Older dates can be cached for longer.
  const journeyTTL: number = isToday(date) ? 5 : 24 * 60 * 60

  const eventsCacheKey = `departure_events_${fetchTarget}_${fetchTargetId}_${date}`
  const departureEvents = await cacheFetch<Vehicles[]>(
    eventsCacheKey,
    () => fetchEvents(getEvents, stops),
    journeyTTL,
    skipCache
  )

  const authorizedDepartures = removeUnauthorizedData<Departure>(departures, user, [
    'operatingUnit',
  ])

  const cancellations = await getCancellations(date, { all: true }, skipCache)

  const departuresWithAlerts = authorizedDepartures.map((departure) => {
    setCancellationsOnDeparture(departure, cancellations)
    return departure
  })

  let departuresWithEvents: Departure[] = []

  // We can still return planned departures without observed events.
  if (!departureEvents || departureEvents.length === 0) {
    departuresWithEvents = orderBy(departuresWithAlerts, 'plannedDepartureTime.departureTime')
  } else {
    departuresWithEvents = combineDeparturesAndEvents(
      departuresWithAlerts,
      departureEvents,
      date,
      exceptions
    )
  }

  return filterDepartures(departuresWithEvents, filters)
}
