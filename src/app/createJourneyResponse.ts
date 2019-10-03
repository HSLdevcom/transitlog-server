import {
  JoreEquipment,
  JoreRouteDepartureData,
  JoreStop,
  JoreStopSegment,
} from '../types/Jore'
import { cacheFetch } from './cache'
import {
  AlertDistribution,
  Departure,
  Direction,
  ExceptionDay,
  Journey,
  JourneyCancellationEvent,
  JourneyEvent,
  JourneyStopEvent,
  PlannedStopEvent,
  Route,
  Stop,
  VehicleId,
} from '../types/generated/schema-types'
import { createJourneyId } from '../utils/createJourneyId'
import { filterByDateChains } from '../utils/filterByDateChains'
import { compact, flatten, get, groupBy, orderBy, unionBy, last, reverse } from 'lodash'
import { createJourneyObject } from './objects/createJourneyObject'
import { getDateFromDateTime, getDepartureTime } from '../utils/time'
import { CachedFetcher } from '../types/CachedFetcher'
import { createPlannedDepartureObject } from './objects/createDepartureObject'
import { createRouteObject } from './objects/createRouteObject'
import { groupEventsByInstances } from '../utils/groupEventsByInstances'
import { createValidVehicleId } from '../utils/createUniqueVehicleId'
import { journeyInProgress } from '../utils/journeyInProgress'
import { getDirection } from '../utils/getDirection'
import { filterByExceptions } from '../utils/filterByExceptions'
import {
  setAlertsOnDeparture,
  setCancellationsOnDeparture,
} from '../utils/setCancellationsAndAlerts'
import { Vehicles } from '../types/EventsDb'
import {
  createJourneyCancellationEventObject,
  createJourneyEventObject,
  createJourneyStopEventObject,
  createPlannedStopEventObject,
} from './objects/createJourneyEventObject'
import pMap from 'p-map'
import { createStopObject } from './objects/createStopObject'
import moment from 'moment-timezone'
import { TZ } from '../constants'
import { isToday, parse } from 'date-fns'
import { createVirtualStopEvents } from '../utils/createVirtualStopEvents'
import { AuthenticatedUser } from '../types/Authentication'
import { requireUser } from '../auth/requireUser'
import { intval, isWithinRange } from '../utils/isWithinRange'

type JourneyRoute = {
  route: Route | null
  departures: Departure[]
}

export type JourneyRouteData = {
  departures: JoreRouteDepartureData[]
  stops: JoreStopSegment[]
}

/**
 * Fetch the journey events and filter out the invalid ones.
 * The value from this function is not cached, but it could be.
 * @param fetcher async function that fetches the journey events
 * @param uniqueVehicleId string that identifies the requested vehicle
 * @returns Promise<Vehicles[]> the filtered events
 */
const fetchValidJourneyEvents: CachedFetcher<Vehicles[]> = async (
  fetcher,
  uniqueVehicleId
) => {
  const events = await fetcher()

  if (events.length === 0) {
    return false
  }

  // There could have been many vehicles operating this journey. Separate them by
  // vehicle ID and use the instance argument to select the set of events.
  const vehicleGroups = groupEventsByInstances(events || [])
  let journeyEvents

  if (uniqueVehicleId) {
    const selectedVehicleGroups = vehicleGroups.find(
      ([groupId]) => groupId === createValidVehicleId(uniqueVehicleId)
    )

    journeyEvents = selectedVehicleGroups ? selectedVehicleGroups[1] : []
  } else {
    const instanceGroup = vehicleGroups[0]
    journeyEvents = instanceGroup[1]
  }

  const validEvents = journeyEvents.filter(
    (pos) => !!pos.lat && !!pos.long && !!pos.journey_start_time
  )
  return validEvents.length !== 0 ? validEvents : false
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
  const journeyRoute: JourneyRouteData = await fetcher()

  if (journeyRoute.departures.length === 0 || journeyRoute.stops.length === 0) {
    return false
  }

  const departures: JoreRouteDepartureData[] = get(journeyRoute, 'departures', []) || []
  const stops: JoreStopSegment[] = get(journeyRoute, 'stops', []) || []
  // A stop segment contains all necessary info for the route
  const journeyRouteObject = createRouteObject(stops[0])

  const validDepartures = filterByDateChains<JoreRouteDepartureData>(
    groupBy(
      departures,
      ({ departure_id, stop_id, day_type, extra_departure }) =>
        `${departure_id}_${stop_id}_${day_type}_${extra_departure}`
    ),
    date
  )

  // The first departure of the journey is found by matching the departure time of the
  // requested journey. This is the time argument. Note that it will be given as a 24h+ time.,
  // so we also need to get a 24+ time for the departure using `getDepartureTime`.
  const originDeparture = validDepartures.find(
    (departure) =>
      getDepartureTime(departure) === time &&
      departure.stop_id === journeyRouteObject.originStopId
  )

  if (!originDeparture) {
    return { route: journeyRouteObject, departures: [] }
  }

  const stopSegmentGroups = groupBy(stops, 'stop_index')
  const validStops = filterByDateChains<JoreStopSegment>(stopSegmentGroups, date)

  if (validStops.length === 0) {
    return { route: journeyRouteObject, departures: [] }
  }

  const journeyDepartures = validDepartures.filter(
    (departure) =>
      originDeparture.day_type === departure.day_type &&
      originDeparture.departure_id === departure.departure_id
  )

  const stopDepartures = journeyDepartures.map((departure) => {
    const stopSegment = validStops.find(
      (stopSegment) =>
        stopSegment.stop_id === departure.stop_id &&
        stopSegment.route_id === departure.route_id &&
        getDirection(stopSegment.direction) === getDirection(departure.direction)
    )

    if (!stopSegment) {
      return null
    }

    const stop = createStopObject(stopSegment)
    return createPlannedDepartureObject(
      departure,
      stop,
      date,
      'journey',
      [],
      originDeparture.stop_id === departure.stop_id
    )
  })

  // Return both the route and the departures that we put so much work into parsing.
  // Note that the route is also returned as a domain object.
  return {
    route: journeyRouteObject,
    departures: filterByExceptions(orderBy(compact(stopDepartures), 'index'), exceptions),
  }
}

/**
 * This function fetches both the journey events and the journey departures using the functions
 * above and caches the result, which is a merge of the planned and observed data.
 * @param fetchRouteData Async function that fetches the route and departures from Jore
 * @param fetchJourneyEvents Async function that fetches the HFP events
 * @param fetchJourneyEquipment Async function that fetches the equipment that operated this journey.
 * @param getStop
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
 */
export async function createJourneyResponse(
  fetchRouteData: () => Promise<JourneyRouteData>,
  fetchJourneyEvents: () => Promise<Vehicles[]>,
  fetchJourneyEquipment: (
    vehicleId: string | number,
    operatorId: string | number
  ) => Promise<JoreEquipment[]>,
  getStop: (stopId: string) => Promise<JoreStop | null>,
  getUnsignedEvents: (vehicleId: string) => Promise<Vehicles[]>,
  getCancellations,
  getAlerts,
  exceptions: ExceptionDay[],
  routeId: string,
  direction: Direction,
  departureDate: string,
  departureTime: string,
  uniqueVehicleId: VehicleId,
  shouldFetchUnsignedEvents: boolean = false,
  user: AuthenticatedUser | null
): Promise<Journey | null> {
  // If a vehicle ID is not provided, we need to figure out which vehicle operated the
  // journey based on the data as the vehicle ID is part of the journey key. If an
  // ID was provided, we can make it part of the key from the start. The journey
  // key is used for caching journey events and departures.
  function getJourneyEventsKey(events: Vehicles[] | null = []) {
    let journeyKey

    const journeyKeyParts = {
      routeId,
      direction,
      departureDate,
      departureTime,
      uniqueVehicleId: '',
    }

    if (uniqueVehicleId) {
      journeyKey = createJourneyId({
        ...journeyKeyParts,
        uniqueVehicleId,
      })
    } else if (events && events.length !== 0) {
      journeyKey = createJourneyId({
        ...journeyKeyParts,
        uniqueVehicleId: get(events, '[0].unique_vehicle_id'),
      })
    } else {
      journeyKey = createJourneyId(journeyKeyParts)
    }

    return journeyKey
  }

  // Fetch events for the journey with the cache key.
  const journeyEvents = await cacheFetch(
    (fetchedEvents) => {
      const key = getJourneyEventsKey(fetchedEvents)
      return `journey_events_${key}`
    },
    () => fetchValidJourneyEvents(fetchJourneyEvents),
    (data) => {
      if (journeyInProgress(data)) {
        console.log('Journey in progress')
        return 1
      }
      return 24 * 60 * 60
    }
  )

  // The journey key was used to fetch the journey, and now we need it to fetch the departures.
  const journeyKey = getJourneyEventsKey(journeyEvents)

  // Fetch the planned departures, the route and stop data.
  const routeCacheKey = `journey_route_departures_${journeyKey}`
  const routeAndDepartures = await cacheFetch<JourneyRoute>(
    routeCacheKey,
    () => fetchJourneyDepartures(fetchRouteData, departureDate, departureTime, exceptions),
    24 * 60 * 60
  )

  // If both of our fetches failed we'll just bail here with null.
  if (!journeyEvents && (!routeAndDepartures || routeAndDepartures.departures.length === 0)) {
    return null
  }

  let unsignedEvents: Vehicles[] = []

  const vehicleId = createValidVehicleId(
    uniqueVehicleId || get(journeyEvents, '[0].unique_vehicle_id', '')
  )

  let unsignedEventsAuthorized: boolean = false

  if (user && shouldFetchUnsignedEvents) {
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

    const [operator = ''] = vehicleId.split('/')
    const operatorGroup = 'op_' + parseInt(operator, 10)
    unsignedEventsAuthorized =
      requireUser(user, 'HSL') || (!!operator && requireUser(user, operatorGroup))

    if (vehicleId && unsignedEventsAuthorized) {
      const unsignedKey = `unsigned_events_${vehicleId}_${departureDate}`

      const unsignedResults = await cacheFetch(
        unsignedKey,
        () => fetchValidUnsignedEvents(vehicleId),
        isToday(departureDate) ? 30 : 30 * 24 * 60 * 60
      )

      if (unsignedResults && unsignedResults.length !== 0) {
        unsignedEvents = unsignedResults
      }
    }
  }

  const { route = null, departures = [] }: JourneyRoute = routeAndDepartures || {
    route: null,
    departures: [],
  }

  // The origin departure of the journey is the first departure in the array.
  const originDeparture = departures[0] || null
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

  setCancellationsOnDeparture(originDeparture, journeyCancellations)

  const cancellationEvents: JourneyCancellationEvent[] = journeyCancellations.map(
    (cancellation) => createJourneyCancellationEventObject(cancellation)
  )

  const plannedStopEvents: PlannedStopEvent[] = departures.map((departure) =>
    createPlannedStopEventObject(departure, journeyAlerts)
  )

  type EventsType =
    | JourneyStopEvent
    | JourneyEvent
    | PlannedStopEvent
    | JourneyCancellationEvent

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
      journeyAlerts,
      journeyCancellations
    )
  }

  // Separate the HFP events into vehicle positions, stop events and the rest of the events.
  const { vehiclePositions = [], stopEvents = [], events = [] } = journeyEvents.reduce(
    (groups: { [key: string]: Vehicles[] }, event) => {
      if (event.event_type === 'VP') {
        groups.vehiclePositions.push(event)
      } else if (['ARS', 'DOO', 'DOC', 'DEP', 'PDE', 'PAS'].includes(event.event_type)) {
        groups.stopEvents.push(event)
      } else {
        groups.events.push(event)
      }

      return groups
    },
    { vehiclePositions: [], stopEvents: [], events: [] }
  )

  // Get the ID of the vehicle that actually operated this journey and fetch its data.
  const { owner_operator_id, vehicle_number } = vehiclePositions[0]
  const equipmentKey = `equipment_${owner_operator_id}_${vehicle_number}`

  const fetchedEquipment = await cacheFetch<JoreEquipment[]>(equipmentKey, () =>
    fetchJourneyEquipment(vehicle_number, owner_operator_id)
  )

  const journeyEquipment = get(fetchedEquipment, '[0]', null) || null

  // Create virtual ARS and DEP stop events from the vehicle positions.
  const virtualStopEvents = createVirtualStopEvents(vehiclePositions, departures)

  // Patch the stop events collection with virtual stop
  // events that we parsed from the vehiclePositions.
  const patchedStopEvents = unionBy(
    stopEvents,
    virtualStopEvents,
    (event) => event.event_type + event.stop
  )

  // Get a listing of all stops visited during this journey, regardless of whether or not
  // the stop was planned.
  const stopGroupedEvents = groupBy(patchedStopEvents, (event) =>
    event.stop ? event.stop : event.next_stop_id
  )

  const stopEventObjects = await pMap(
    Object.entries(stopGroupedEvents),
    async ([stopId, eventsForStop]) => {
      const departure: Departure | undefined = departures.find((dep) => dep.stopId === stopId)
      let stop: Stop | null = get(departure, 'stop', null)

      if (!stop) {
        const joreStop = await getStop(stopId)

        if (joreStop) {
          const stopAlerts = journeyAlerts.filter(
            (alert) =>
              alert.distribution === AlertDistribution.AllStops ||
              alert.affectedId === joreStop.stop_id
          )

          stop = createStopObject(joreStop, [], stopAlerts)
        }
      }

      if (departure) {
        setAlertsOnDeparture(departure, journeyAlerts)
      }

      const doorsOpened = eventsForStop.some((evt) => evt.event_type === 'DOO')
      const stopped = eventsForStop.some((evt) => evt.event_type !== 'PAS')

      const useDEP = get(departure, 'isTimingStop', false) || get(departure, 'isOrigin', false)

      return eventsForStop.map((event) =>
        ['ARS', useDEP ? 'DEP' : 'PDE'].includes(event.event_type)
          ? createJourneyStopEventObject(event, departure || null, stop, doorsOpened, stopped)
          : createJourneyEventObject(event)
      )
    }
  )

  // Create event objects from other events
  const otherEvents = events.map((event) => createJourneyEventObject(event))
  const flatStopEventObjects: Array<JourneyEvent | JourneyStopEvent> = flatten(
    stopEventObjects
  )

  // Exclude planned stops that did end up having events attached to them.
  const stopsWithoutEvents = plannedStopEvents.reduce(
    (deduplicated: PlannedStopEvent[], plannedEvent) => {
      const stopWithEvent = flatStopEventObjects.some(
        (evt) =>
          get(evt, 'stopId', '') === plannedEvent.stopId &&
          get(evt, 'index', -1) === plannedEvent.index
      )

      if (!stopWithEvent) {
        deduplicated.push(plannedEvent)
      }

      return deduplicated
    },
    []
  )

  // Combine all created event objects and order by time.
  const allJourneyEvents = orderBy<EventsType>(
    compact([
      ...flatStopEventObjects,
      ...otherEvents,
      ...stopsWithoutEvents,
      ...cancellationEvents,
    ]),
    (event) => parse(get(event, 'recordedAt', get(event, 'plannedDateTime'))).getTime() / 1000,
    'asc'
  )

  let finalPositions = vehiclePositions

  if (unsignedEventsAuthorized) {
    const firstEvent = vehiclePositions[0]
    const lastEvent = last(vehiclePositions)

    // Journey start
    const minDate = firstEvent ? intval(firstEvent.tsi) : departureDateTime.unix()
    // Journey end timestamp (or scheduled start)
    const maxDate = lastEvent ? intval(lastEvent.tsi) : departureDateTime.unix()

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

    finalPositions = orderBy([...vehiclePositions, ...validUnsigned], 'tsi', 'asc')
  }

  // Everything is baked into a Journey object.
  return createJourneyObject(
    finalPositions,
    allJourneyEvents,
    route,
    originDeparture,
    journeyEquipment,
    journeyAlerts,
    journeyCancellations
  )
}
