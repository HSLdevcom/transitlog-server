import {
  Route as JoreRoute,
  RouteSegment,
  Departure as JoreDeparture,
} from '../types/generated/jore-types'
import { cacheFetch } from './cache'
import { Vehicles } from '../types/generated/hfp-types'
import { Departure, Direction, Journey, Route } from '../types/generated/schema-types'
import { createJourneyId } from '../utils/createJourneyId'
import { filterByDateChains } from '../utils/filterByDateChains'
import { get, groupBy, sortBy, orderBy } from 'lodash'
import { createJourneyObject } from './objects/createJourneyObject'
import { getDepartureTime } from '../utils/time'
import { CachedFetcher } from '../types/CachedFetcher'
import { StopSegmentCombo } from '../types/StopSegmentCombo'
import { createDepartureId, createPlannedDepartureObject } from './objects/createDepartureObject'
import { PlannedDeparture } from '../types/PlannedDeparture'
import { getStopArrivalData } from '../utils/getStopArrivalData'
import { getStopDepartureData } from '../utils/getStopDepartureData'
import { createStopObject } from './objects/createStopObject'
import { createRouteObject } from './objects/createRouteObject'

type JourneyRoute = {
  route: Route
  departures: PlannedDeparture[]
}

// Fetch the journey events and filter out the invalid ones.
// TODO: Include null lat/lon or start_time when the app has to deal with those.
const fetchJourneyEvents: CachedFetcher<Vehicles[]> = async (fetcher) => {
  const events = await fetcher()

  if (events.length === 0) {
    return false
  }

  return events.filter((pos) => !!pos.lat && !!pos.long && !!pos.journey_start_time)
}

const fetchJourneyDepartures: CachedFetcher<JourneyRoute> = async (fetcher, date, time) => {
  const journeyRoute = await fetcher()

  if (!journeyRoute) {
    return false
  }

  const routeSegments: RouteSegment[] = get(journeyRoute, 'routeSegments.nodes', []) || []
  const validRouteSegments = filterByDateChains<RouteSegment>(
    groupBy(
      routeSegments,
      (segment) => segment.stopId + segment.stopIndex + segment.timingStopType
    ),
    date
  )
  const sortedRouteSegments = sortBy(validRouteSegments, 'stopIndex')

  const stops = sortedRouteSegments.map(
    (routeSegment): StopSegmentCombo => {
      const groupedDepartures = groupBy(
        get(routeSegment, 'stop.departures.nodes', []),
        createDepartureId
      )

      const validDepartures = filterByDateChains<JoreDeparture>(groupedDepartures, date)

      return {
        destination: routeSegment.destinationFi || '',
        distanceFromPrevious: routeSegment.distanceFromPrevious,
        distanceFromStart: routeSegment.distanceFromStart,
        duration: routeSegment.duration,
        stopIndex: routeSegment.stopIndex,
        isTimingStop: !!routeSegment.timingStopType,
        ...createStopObject(get(routeSegment, 'stop', {})),
        departures: validDepartures,
      }
    }
  )

  const firstStopDepartures = get(stops, '[0].departures', [])

  const originDeparture =
    firstStopDepartures.find(
      ({ hours, minutes, isNextDay }) => getDepartureTime({ hours, minutes, isNextDay }) === time
    ) || null

  if (!originDeparture) {
    return false
  }

  const departures = stops.map((stop) => {
    const departure = stop.departures.filter(
      (dep) => dep.departureId === originDeparture.departureId
    )[0]

    return createPlannedDepartureObject(departure, stop, date)
  })

  return { route: createRouteObject(journeyRoute), departures }
}

export async function createJourneyResponse(
  getJourneyRoute: () => Promise<JoreRoute[]>,
  getJourneyEvents: () => Promise<Vehicles[]>,
  routeId: string,
  direction: Direction,
  departureDate: string,
  departureTime: string,
  instance: number = 0
): Promise<Journey | null> {
  const journeyKey = createJourneyId({
    routeId,
    direction,
    departureDate,
    departureTime,
  })

  const fetchAndProcessJourney = async () => {
    let journeyEvents = await fetchJourneyEvents(getJourneyEvents)
    const vehicleGroups = Object.values(groupBy(journeyEvents || null, 'unique_vehicle_id'))

    journeyEvents = vehicleGroups[instance]

    if (!journeyEvents || journeyEvents.length === 0) {
      return false
    }

    const events: Vehicles[] = journeyEvents

    const routeCacheKey = `journey_route_departures_${journeyKey}`
    const routeAndDepartures = await cacheFetch<JourneyRoute>(
      routeCacheKey,
      () => fetchJourneyDepartures(getJourneyRoute, departureDate, departureTime),
      24 * 60 * 60
    )

    if (!routeAndDepartures || routeAndDepartures.departures.length === 0) {
      return createJourneyObject(events, null, [], null, instance)
    }

    const { route, departures } = routeAndDepartures

    const observedDepartures: Departure[] = departures.map(
      (departure: PlannedDeparture): Departure => {
        const stopEvents = orderBy(
          events.filter((pos) => pos.next_stop_id === departure.stopId),
          'tsi',
          'desc'
        )

        const stopArrival = departure
          ? getStopArrivalData(stopEvents, departure, departureDate)
          : null

        const stopDeparture = departure
          ? getStopDepartureData(stopEvents, departure, departureDate)
          : null

        return {
          ...departure,
          observedDepartureTime: stopDeparture,
          observedArrivalTime: stopArrival,
        }
      }
    )

    return createJourneyObject(events, route, observedDepartures, null, instance)
  }

  const journeyCacheKey = `journey_${createJourneyId({
    routeId,
    direction,
    departureDate,
    departureTime,
  })}`

  const journey = await cacheFetch<Journey>(journeyCacheKey, fetchAndProcessJourney, 5)

  if (!journey) {
    return null
  }

  return journey
}
