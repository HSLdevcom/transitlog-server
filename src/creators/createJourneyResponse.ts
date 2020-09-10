import { JoreDeparture, JoreEquipment, JoreRouteStop } from '../types/Jore'
import { cacheFetch } from '../cache'
import {
  Alert,
  Departure,
  ExceptionDay,
  Journey,
  JourneyCancellationEvent,
  JourneyEvent,
  JourneyStopEvent,
  JourneyTlpEvent,
  PlannedStopEvent,
  Route,
  Scalars,
  Stop,
} from '../types/generated/schema-types'
import { createJourneyId } from '../utils/createJourneyId'
import { filterByDateChains } from '../utils/filterByDateChains'
import {
  compact,
  findLastIndex,
  flatten,
  get,
  groupBy,
  last,
  mapValues,
  orderBy,
  reverse,
} from 'lodash'
import { createJourneyObject } from '../objects/createJourneyObject'
import { getDateFromDateTime, getDepartureTime } from '../utils/time'
import { CachedFetcher } from '../types/CachedFetcher'
import { createPlannedDepartureObject } from '../objects/createDepartureObject'
import { createRouteObject } from '../objects/createRouteObject'
import { groupEventsByInstances } from '../utils/groupEventsByInstances'
import { createValidVehicleId } from '../utils/createUniqueVehicleId'
import { journeyInProgress } from '../utils/journeyInProgress'
import { filterByExceptions } from '../utils/filterByExceptions'
import {
  setAlertsOnDeparture,
  setCancellationsOnDeparture,
} from '../utils/setCancellationsAndAlerts'
import { JourneyEvents, Vehicles } from '../types/EventsDb'
import {
  createJourneyCancellationEventObject,
  createJourneyEventObject,
  createJourneyStopEventObject,
  createJourneyTlpEventObject,
  createPlannedStopEventObject,
} from '../objects/createJourneyEventObject'
import { createStopObject } from '../objects/createStopObject'
import moment from 'moment-timezone'
import { TZ } from '../constants'
import { isToday } from 'date-fns'
import { createVirtualStopEvents } from '../utils/createVirtualStopEvents'
import { AuthenticatedUser } from '../types/Authentication'
import { requireVehicleAuthorization } from '../auth/requireUser'
import { intval } from '../utils/isWithinRange'
import { toLatLng } from '../geometry/LatLng'
import { removeUnauthorizedData } from '../auth/removeUnauthorizedData'
import { extraDepartureType } from '../utils/extraDepartureType'
import { filterByDateGroups } from '../utils/filterByDateGroups'
import { getCorrectDepartureEventType } from '../utils/getCorrectDepartureEventType'
import { Moment } from 'moment'
import { AlertSearchProps } from '../getAlerts'

type JourneyRoute = {
  route: Route | null
  departures: Departure[]
  stops: Stop[]
}

type EventsType =
  | JourneyStopEvent
  | JourneyEvent
  | PlannedStopEvent
  | JourneyCancellationEvent
  | JourneyTlpEvent

export type PlannedJourneyData = {
  departures: JoreDeparture[]
  routes: JoreRouteStop[]
}

const isPlannedEvent = (event: any): event is PlannedStopEvent => event.type === 'PLANNED'

const isStopEvent = (event: any): event is PlannedStopEvent | JourneyStopEvent =>
  typeof event.index !== 'undefined'

const isTlpEvent = (event: any): event is JourneyTlpEvent =>
  typeof event.requestId !== 'undefined'

const tlpEventRequestId = (event: any): event is JourneyTlpEvent => event.requestId

/**
 * Fetch the journey events and filter out the invalid ones.
 * @param fetcher async function that fetches the journey events
 * @param uniqueVehicleId string that identifies the requested vehicle
 * @returns Promise<Vehicles[]> the filtered events
 */
const fetchValidJourneyEvents: CachedFetcher<JourneyEvents> = async (
  fetcher,
  uniqueVehicleId
): Promise<JourneyEvents | false> => {
  type JourneyEventGroup = Array<[string, Vehicles[]]>
  type GroupedJourneyEvents = { [key: string]: JourneyEventGroup }

  const events: JourneyEvents = await fetcher()

  if (flatten(Object.values(events)).length === 0) {
    return false
  }

  // There could have been many vehicles operating this journey. Separate them by
  // vehicle ID and use the instance argument to select the set of events.
  const vehicleGroupedEvents: GroupedJourneyEvents = mapValues(events, (val) =>
    groupEventsByInstances(val, true)
  )

  let selectedVehicleId = uniqueVehicleId

  // @ts-ignore typing lodash functions is impossible
  return mapValues<JourneyEvents>(vehicleGroupedEvents, (groups: JourneyEventGroup) => {
    if (!selectedVehicleId) {
      let seq1Group = groups.find(([, eventGroup]) => eventGroup.some((evt) => evt.seq === 1))

      if (!seq1Group) {
        selectedVehicleId = get(groups, '[0][0]', '')
      } else {
        selectedVehicleId = seq1Group[0]
      }
    }

    const selectedGroup = groups.find(
      ([groupVehicleId]) => groupVehicleId === createValidVehicleId(selectedVehicleId)
    )

    const selectedGroupEvents = selectedGroup ? selectedGroup[1] : []
    return orderBy(selectedGroupEvents, 'tsi', 'asc')
  })
}

/**
 * Fetch the full route data with segments, stops and departures, and reduce that down to
 * a list of planned departures for each stop of the route. Returns the basic route data and
 * the list of departures.
 * @param fetcher The async function that fetches the full route data
 * @param date The date during which that the route and departures should be valid.
 * @param time The time of the planned departure from the first stop.
 * @param exceptions
 * @returns Promise<JourneyRoute> Includes the route data and the departures.
 */
const fetchJourneyDepartures: CachedFetcher<JourneyRoute> = async (
  fetcher,
  date,
  time,
  exceptions
) => {
  const plannedJourney: PlannedJourneyData = await fetcher()
  const departures: JoreDeparture[] = get(plannedJourney, 'departures', []) || []
  const routes: JoreRouteStop[] = get(plannedJourney, 'routes', []) || []

  if (departures.length === 0 || routes.length === 0) {
    return false
  }

  let validRoutes = filterByDateGroups<JoreRouteStop>(routes, date)
  // Sorted by the order of the stops in the journey.
  let routeStops: JoreRouteStop[] = orderBy(validRoutes, 'stop_index', 'asc')

  let firstStop = routeStops.find(
    (routeSegment) => routeSegment.stop_id === routeSegment.originstop_id
  )

  // A stop segment contains all necessary info for the route
  let journeyRoute = createRouteObject(!firstStop ? routeStops[0] : firstStop)

  if (!journeyRoute) {
    return false
  }

  let groupedDepartures = groupBy(
    departures,
    ({ stop_id, day_type, extra_departure }) =>
      `${stop_id}_${day_type}_${extraDepartureType(extra_departure)}`
  )

  let validDepartures = filterByDateChains<JoreDeparture>(groupedDepartures, date)

  // The first departure of the journey is found by matching the departure time of the
  // requested journey. This is the time argument. Note that it will be given as a 24h+ time.,
  // so we also need to get a 24+ time for the departure using `getDepartureTime`.
  let originDeparture = validDepartures.find(
    (departure) =>
      getDepartureTime(departure) === time && departure.stop_id === departure.origin_stop_id
  )

  if (!originDeparture) {
    return { route: journeyRoute, departures: [], stops: [] }
  }

  const journeyDepartures = validDepartures.filter(
    (departure) =>
      getDepartureTime(departure, 'origin') === time &&
      // Without the ! Typescript complains that originDeparture is undefined.
      // IN WHAT WORLD CAN IT BE UNDEFINED HERE
      originDeparture!.day_type === departure.day_type
  )

  // TODO: calculate duration
  const plannedDuration = get(last(routeStops), 'duration', 0)
  journeyRoute = createRouteObject(routeStops[0], [], plannedDuration || 0)

  const departureObjects: Array<Departure | null> = journeyDepartures.map((departure) => {
    return createPlannedDepartureObject(
      departure,
      date,
      'journey',
      [],
      departure.origin_stop_id === departure.stop_id
    )
  })

  let stopObjects = compact(routeStops.map((rs) => createStopObject(rs)))

  // Return both the route and the departures that we put so much work into parsing.
  // Note that the route is also returned as a domain object.
  return {
    route: journeyRoute,
    stops: stopObjects,
    departures: filterByExceptions(orderBy(compact(departureObjects), 'index'), exceptions),
  }
}

/**
 * This function fetches both the journey events and the journey departures using the functions
 * above and caches the result, which is a merge of the planned and observed data.
 * @param fetchRouteData Async function that fetches the route and departures from Jore
 * @param fetchJourneyEvents Async function that fetches the HFP events
 * @param fetchJourneyEquipment Async function that fetches the equipment that operated this journey.
 * @param getUnsignedEvents
 * @param getCancellations Async function that returns cancellations
 * @param getAlerts Async function that returns alerts
 * @param exceptions Exceptions in effect during departureDate
 * @param routeId The route ID of the requested journey
 * @param direction The direction of the requested journey
 * @param departureDate The operation date of the journey
 * @param departureTime The journey's departure from the first stop.
 * @param uniqueVehicleId
 * @param shouldFetchUnsignedEvents
 * @param user
 * @param skipCache
 */
export async function createJourneyResponse(
  user: AuthenticatedUser | null,
  fetchRouteData: () => Promise<PlannedJourneyData>,
  fetchJourneyEvents: () => Promise<JourneyEvents>,
  fetchJourneyEquipment: (
    vehicleId: string | number,
    operatorId: string | number
  ) => Promise<JoreEquipment[]>,
  getUnsignedEvents: (vehicleId: string) => Promise<Vehicles[]>,
  getCancellations,
  getAlerts: (dateTime: Moment | string, alertSearchProps: AlertSearchProps) => Alert[],
  exceptions: ExceptionDay[],
  routeId: string,
  direction: Scalars['Direction'],
  departureDate: string,
  departureTime: string,
  uniqueVehicleId: Scalars['VehicleId'],
  shouldFetchUnsignedEvents: boolean = false,
  skipCache: boolean = false
): Promise<Journey | null> {
  // If a vehicle ID is not provided, we need to figure out which vehicle operated the
  // journey based on the data as the vehicle ID is part of the journey key. If an
  // ID was provided, we can make it part of the key from the start. The journey
  // key is used for caching journey events and departures.
  function getJourneyEventsKey(events: JourneyEvents | null) {
    let journeyKey

    const journeyKeyParts = {
      routeId,
      direction,
      departureDate,
      departureTime,
      uniqueVehicleId: '',
    }

    const vpEvents = events ? events.vehiclePositions : []

    if (uniqueVehicleId) {
      journeyKey = createJourneyId({
        ...journeyKeyParts,
        uniqueVehicleId,
      })
    } else if (vpEvents.length !== 0) {
      journeyKey = createJourneyId({
        ...journeyKeyParts,
        uniqueVehicleId: get(vpEvents, '[0].unique_vehicle_id'),
      })
    } else {
      journeyKey = createJourneyId(journeyKeyParts)
    }

    return journeyKey
  }

  // Fetch events for the journey with the cache key.
  const journeyEvents = await cacheFetch<JourneyEvents>(
    (fetchedEvents: JourneyEvents) => {
      const key = getJourneyEventsKey(fetchedEvents)
      return `journey_events_${key}`
    },
    () => fetchValidJourneyEvents(fetchJourneyEvents),
    (data) => {
      if (journeyInProgress(data.vehiclePositions)) {
        return 1
      }
      return 24 * 60 * 60
    },
    skipCache
  )

  // The journey key was used to fetch the journey, and now we need it to fetch the departures.
  const journeyKey = getJourneyEventsKey(journeyEvents)

  // Fetch the planned departures, the route and stop data.
  const routeCacheKey = `journey_route_departures_${journeyKey}`
  const routeAndDepartures = await cacheFetch<JourneyRoute>(
    routeCacheKey,
    () => fetchJourneyDepartures(fetchRouteData, departureDate, departureTime, exceptions),
    24 * 60 * 60,
    skipCache
  )

  // If both of our fetches failed we'll just bail here with null.
  if (
    journeyEvents?.vehiclePositions?.length === 0 ||
    routeAndDepartures?.departures?.length === 0
  ) {
    return null
  }

  let unsignedEvents: Vehicles[] = []

  const vehicleId = createValidVehicleId(
    uniqueVehicleId || get(journeyEvents, 'vehiclePositions.[0].unique_vehicle_id', '')
  )

  let userAuthorizedForVehicle: boolean = false

  if (shouldFetchUnsignedEvents && requireVehicleAuthorization(user, vehicleId)) {
    userAuthorizedForVehicle = true

    const fetchValidUnsignedEvents: CachedFetcher<Vehicles[]> = async (fetchVehicleId) => {
      const events = await getUnsignedEvents(fetchVehicleId)

      if (!events || events.length === 0) {
        return false
      }

      const validEvents = events.filter(
        (pos) => !!pos.lat && !!pos.long && !!pos.unique_vehicle_id
      )

      return validEvents.length !== 0 ? validEvents : false
    }

    const unsignedKey = `unsigned_events_${vehicleId}_${departureDate}`

    const unsignedResults = await cacheFetch(
      unsignedKey,
      () => fetchValidUnsignedEvents(vehicleId),
      isToday(departureDate) ? 30 : 30 * 24 * 60 * 60,
      skipCache
    )

    if (unsignedResults && unsignedResults.length !== 0) {
      unsignedEvents = unsignedResults
    }
  }

  const { route = null, departures = [], stops = [] }: JourneyRoute = routeAndDepartures || {
    route: null,
    departures: [],
    stops: [],
  }

  const authorizedDepartures = removeUnauthorizedData<Departure>(departures, user, [
    'operatingUnit',
  ])

  // The origin departure of the journey is the first departure in the array.
  const originDeparture = authorizedDepartures[0] || null

  // Terminal and recovery time needs to be hidden from unauthorized users.
  if (originDeparture && !requireVehicleAuthorization(user, vehicleId)) {
    originDeparture.recoveryTime = null
    originDeparture.terminalTime = null
  }

  const departureDateTime = getDateFromDateTime(departureDate, departureTime)

  // The current alerts for this journey
  const journeyAlerts = await getAlerts(departureDateTime, {
    allRoutes: true,
    allStops: true,
    route: routeId,
    stop: true,
  })

  // Any cancellations for this journey.
  const journeyCancellations = await getCancellations(departureDate, {
    routeId,
    direction,
    departureTime,
  })

  if (originDeparture) {
    setCancellationsOnDeparture(originDeparture, journeyCancellations)
  }

  const cancellationEvents: JourneyCancellationEvent[] = journeyCancellations.map(
    (cancellation) => createJourneyCancellationEventObject(cancellation)
  )

  const plannedStopEvents: PlannedStopEvent[] = authorizedDepartures.map((departure) => {
    let stop = stops.find((stop) => departure.stopId === stop.stopId)
    return createPlannedStopEventObject(departure, stop, journeyAlerts)
  })

  const stopAndCancellationEvents = orderBy<EventsType>(
    compact([...cancellationEvents, ...plannedStopEvents]),
    (event) => moment.tz(get(event, 'recordedAt', get(event, 'plannedDateTime')), TZ).unix(),
    'asc'
  )

  // At this point we have everything we need to return just the planned
  // part of this journey in case we got no events.
  if (!journeyEvents) {
    return createJourneyObject(
      [],
      stopAndCancellationEvents,
      route,
      originDeparture,
      null,
      null,
      journeyAlerts,
      journeyCancellations,
      departureDate
    )
  }

  // Separate the HFP events into vehicle positions, stop events and the rest of the events.
  const {
    vehiclePositions = [],
    stopEvents = [],
    tlpEvents = [],
    otherEvents: events = [],
  } = journeyEvents

  let journeyEquipment = null
  const ascVehiclePositions = orderBy(vehiclePositions, 'tsi', 'asc')

  if (requireVehicleAuthorization(user, vehicleId) && ascVehiclePositions.length !== 0) {
    // Get the ID of the vehicle that actually operated this journey and fetch its data.
    const { owner_operator_id, vehicle_number } = ascVehiclePositions[0]
    const equipmentKey = `equipment_${owner_operator_id}_${vehicle_number}`

    const fetchedEquipment = await cacheFetch<JoreEquipment[]>(equipmentKey, () =>
      fetchJourneyEquipment(vehicle_number, owner_operator_id)
    )

    journeyEquipment = get(fetchedEquipment, '[0]', null) || null
  }

  // Create virtual ARS, DEP/PDE and DOO stop events from the vehicle positions.
  const virtualStopEvents = createVirtualStopEvents(ascVehiclePositions, authorizedDepartures)

  // Patch the stop events collection with virtual stop
  // events that we parsed from the ascVehiclePositions.
  let patchedStopEvents = [...stopEvents]

  // Patch stop events by using virtual events for all stops which have no real stop events.
  for (const virtualStopEvent of virtualStopEvents) {
    const { event_type, stop } = virtualStopEvent
    const canUsePas = ['ARS', 'DEP', 'PDE'].includes(event_type)

    const eventExists = patchedStopEvents.some((evt) => {
      // Skip virtual departure events when a PAS event for the stop exists
      if (canUsePas && evt.event_type === 'PAS' && evt.stop === stop) {
        return true
      }

      return evt.event_type + evt.stop === event_type + stop
    })

    if (!eventExists) {
      patchedStopEvents.push(virtualStopEvent)
    }
  }

  patchedStopEvents = orderBy(patchedStopEvents, 'tsi', 'asc')

  // Get a listing of all stops visited during this journey,
  // regardless of whether or not the stop was planned.
  const stopGroupedEvents: { [key: string]: Vehicles[] } = groupBy(patchedStopEvents, (evt) =>
    evt.stop ? evt.stop + '' : evt.next_stop_id ? evt.next_stop_id + '' : 'unknown'
  )

  // Create event objects from other events and include cancellation events.
  const journeyEventObjects: Array<JourneyEvent | JourneyCancellationEvent> = [
    ...events.map((event) => createJourneyEventObject(event)),
    ...cancellationEvents,
  ]

  const stopEventObjects: JourneyStopEvent[] = []

  // Match events to departures using a variety of methods depending on what data we have available.
  // Then create the appropriate type of JourneyEvent based on timing stop status etc.
  for (const [stopId, eventsForStop] of Object.entries(stopGroupedEvents)) {
    // Use matchedStopId to search for a stop if none is attached to the departure.
    let matchedStopId: string = ''
    let departure: Departure | undefined
    let stop: Stop | undefined

    if (stopId !== 'unknown') {
      matchedStopId = stopId + ''
      departure = authorizedDepartures.find((dep) => dep.stopId === stopId + '')
      stop = stops.find((stop) => stop.stopId === stopId)
    }

    let departureEventType = getCorrectDepartureEventType(eventsForStop, departure)

    for (const eventItem of eventsForStop) {
      if (stopId === 'unknown' && eventItem.lat && eventItem.long) {
        // If the event has no stopId (= unknown), match a departure to each event in
        // the group by matching the event and departure stop locations.

        // Reset matchedStopId because events in the "unknown" group may not belong to the same stop.
        matchedStopId = ''
        // Match events without stopIds to stops by location.
        departure = authorizedDepartures.find((dep) => {
          let stop = stops.find((stop) => stop.stopId === dep.stopId)

          if (!stop) {
            return false
          }

          // Match the departure to the event by stop and event location
          const { lat, lng } = stop
          const stopArea = toLatLng(lat, lng).toBounds(200) // Search around 100m in each direction

          return stopArea.contains([eventItem.lat, eventItem.long])
        })

        if (departure) {
          matchedStopId = departure.stopId || ''
        }
      }

      // If that didn't work, fetch the stop from JORE with the stopId we have.
      if (!stop && matchedStopId) {
        stop = stops.find((stop) => stop.stopId === matchedStopId)
      }

      if (departure) {
        setAlertsOnDeparture(departure, journeyAlerts)
      }

      let doorsOpened = !!eventItem.drst
      doorsOpened = eventsForStop.some((evt) => evt.event_type === 'DOO')

      let shouldCreateStopEventObject =
        !!stop && ['ARS', departureEventType, 'PAS'].includes(eventItem.event_type)

      if (!shouldCreateStopEventObject) {
        // If this should not be a stop event, put it in the journeyEventObjects array.
        const eventObject = createJourneyEventObject(eventItem)
        journeyEventObjects.push(eventObject)
      } else if (shouldCreateStopEventObject) {
        // Stop events go in the stopEventObjects array.
        const eventObject = createJourneyStopEventObject(
          eventItem,
          departure || null,
          stop,
          doorsOpened
        )
        stopEventObjects.push(eventObject)
      }
    }
  }

  // Exclude planned stops that did end up having events attached to them.
  const stopsWithoutEvents: PlannedStopEvent[] = plannedStopEvents.reduce(
    (deduplicated: PlannedStopEvent[], plannedEvent) => {
      const stopWithEvent = stopEventObjects.some(
        (evt) =>
          get(evt, 'stopId', '') === plannedEvent.stopId &&
          get(evt, 'index', 0) === plannedEvent.index
      )

      if (!stopWithEvent) {
        deduplicated.push(plannedEvent)
      }

      return deduplicated
    },
    []
  )

  // Planned stops should be ordered by stop order.
  const sortedPlannedEvents: PlannedStopEvent[] = orderBy(stopsWithoutEvents, 'index')

  // Create TLP event objects
  const tlpEventObjects: JourneyTlpEvent[] = tlpEvents.map((event) =>
    createJourneyTlpEventObject(event)
  )

  const tlaEvents = tlpEventObjects.filter((event) => event.type === 'TLA')
  const tlrEvents = tlpEventObjects.filter((event) => event.type === 'TLR')

  tlaEvents.forEach((tlaEvent) => {
    const matchingTlrEvents = tlrEvents.filter(
      (tlrEvent) => tlrEvent.requestId === tlaEvent.requestId
    )
    if (matchingTlrEvents.length > 0) {
      // set junctionId of the TLA from one of the corresponding TLR events
      tlaEvent.junctionId = matchingTlrEvents[0].junctionId
      if (matchingTlrEvents.length === 1) {
        matchingTlrEvents[0].decision = tlaEvent.decision
      }
      // if more than one TLR corresponds to the TLA, only set the decision of the last TLR
      if (matchingTlrEvents.length > 1) {
        const attemptSeqs: number[] = matchingTlrEvents
          .map((event) => event.attemptSeq!)
          .filter((attempt) => attempt)

        const lastAttemptSeq = Math.max(...attemptSeqs)
        const lastTlrAttemptEvent = matchingTlrEvents.find(
          (event) => event.attemptSeq === lastAttemptSeq
        )
        if (lastTlrAttemptEvent) {
          lastTlrAttemptEvent.decision = tlaEvent.decision
        }
      }
    }
  })

  const stopEventOrder = ['ARR', 'ARS', 'PAS', 'PDE', 'DEP']

  // Sort observed (ie real) events by timestamp, but also with additional logic as (old) timestamps do not include milliseconds
  const sortedJourneyEvents: EventsType[] = [
    ...stopEventObjects,
    ...journeyEventObjects,
    ...tlrEvents,
    ...tlaEvents,
  ].sort((eventA, eventB) => {
    if (eventA._sort && eventB._sort) {
      const sort = eventA._sort - eventB._sort
      // introduce custom ordering logic for events with same timestamp
      if (sort === 0) {
        // order TLP events by requestId (if different)
        if (
          tlpEventRequestId(eventA) &&
          tlpEventRequestId(eventB) &&
          tlpEventRequestId(eventA) !== tlpEventRequestId(eventB)
        ) {
          return tlpEventRequestId(eventA) > tlpEventRequestId(eventB) ? 1 : -1
        } else if (eventA.type === 'TLA' && eventB.type === 'TLR') {
          // order TLA event after TLR
          return 1
        } else if (eventA.type === 'TLR' && eventB.type === 'TLA') {
          return -1
        } else if (isTlpEvent(eventA) && !isTlpEvent(eventB)) {
          // order TLP events after other events with same timestamp
          return 1
        }

        let typeAIdx = stopEventOrder.indexOf(eventA.type)
        let typeBIdx = stopEventOrder.indexOf(eventB.type)

        if (typeAIdx >= 0 && typeBIdx >= 0) {
          return typeAIdx > typeBIdx ? 1 : -1
        }

        // By default sort event A before event B.
        return -1
      } else {
        return sort
      }
    } else {
      return -1
    }
  })

  // Get the time info from an event.
  const getTimeFromEvent = (event: EventsType): number => {
    if (isPlannedEvent(event)) {
      return event?.plannedUnix || 0
    }

    return event?.recordedAtUnix || 0
  }

  for (const plannedEvent of sortedPlannedEvents) {
    let insertIndex = 0
    const eventTime = plannedEvent?.plannedUnix || 0

    if (plannedEvent.index === 1) {
      // For the first stop, find the earliest index where we can insert the planned stop.
      insertIndex = sortedJourneyEvents.findIndex(
        (event) => getTimeFromEvent(event) >= eventTime
      )

      if (insertIndex < 1) {
        insertIndex = 0
      }
    } else {
      let prevStopIndex = findLastIndex(
        sortedJourneyEvents,
        (event) => isStopEvent(event) && event.index < plannedEvent.index
      )

      prevStopIndex = prevStopIndex + 1

      const eventIndex = findLastIndex(
        sortedJourneyEvents,
        (event) => getTimeFromEvent(event) <= eventTime
      )

      insertIndex = Math.max(prevStopIndex, eventIndex)
    }

    if (insertIndex !== -1) {
      sortedJourneyEvents.splice(insertIndex, 0, plannedEvent)
    }
  }

  let finalPositions = ascVehiclePositions

  // Get unsigned events that happened before and after the journey.
  if (userAuthorizedForVehicle && shouldFetchUnsignedEvents) {
    const firstEvent = ascVehiclePositions[0]
    const lastEvent = last(ascVehiclePositions)

    // Journey start
    const minDate = firstEvent ? intval(firstEvent?.tsi || 0) : departureDateTime.unix()
    // Journey end timestamp (or scheduled start)
    const maxDate = lastEvent ? intval(lastEvent?.tsi || 0) : departureDateTime.unix()

    const unsignedAroundJourney = groupBy(unsignedEvents, ({ tsi }) => {
      const intTsi = intval(tsi)
      return intTsi <= minDate ? 'before' : intTsi >= maxDate ? 'after' : 'during'
    })

    const validUnsigned: Vehicles[] = []

    for (const [group, events] of Object.entries(unsignedAroundJourney)) {
      let prevUnsigned: Vehicles | null = null
      let prevTime = 0

      const eventsArr = group === 'before' ? reverse(events) : events

      for (const event of eventsArr) {
        let diff = 0

        if (prevUnsigned) {
          diff = Math.abs(intval(event.tsi) - prevTime)
        }

        if (diff <= 30 * 60) {
          prevUnsigned = event
          prevTime = intval(event.tsi)
          validUnsigned.push(event)
        }
      }
    }

    finalPositions = orderBy([...ascVehiclePositions, ...validUnsigned], 'tsi', 'asc')
  }

  // Everything is baked into a Journey object.
  return createJourneyObject(
    finalPositions,
    sortedJourneyEvents,
    route,
    originDeparture,
    authorizedDepartures,
    journeyEquipment,
    journeyAlerts,
    journeyCancellations
  )
}
