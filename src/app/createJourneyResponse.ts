import { Route as JoreRoute, RouteSegment } from '../types/generated/jore-types'
import { cacheFetch } from './cache'
import { Vehicles } from '../types/generated/hfp-types'
import { Departure, Direction, Journey } from '../types/generated/schema-types'
import { createJourneyId } from '../utils/createJourneyId'
import { filterByDateChains } from '../utils/filterByDateChains'
import { get, groupBy, omit, sortBy, orderBy } from 'lodash'
import { createJourneyObject } from './objects/createJourneyObject'
import { getDepartureTime } from '../utils/time'
import { getValidDepartures } from '../utils/getValidDepartures'
import { CachedFetcher } from '../types/CachedFetcher'
import { StopSegmentCombo } from '../types/StopSegmentCombo'
import { createPlannedDepartureObject } from './objects/createDepartureObject'
import { PlannedDeparture } from '../types/PlannedDeparture'
import { getStopArrivalData } from '../utils/getStopArrivalData'
import { getStopDepartureData } from '../utils/getStopDepartureData'
import { createStopObject } from './objects/createStopObject'

export async function createJourneyResponse(
  getJourneyRoute: () => Promise<JoreRoute[]>,
  getJourneyEvents: () => Promise<Vehicles[]>,
  routeId: string,
  direction: Direction,
  departureDate: string,
  departureTime: string,
  instance: number = 0
): Promise<Journey | null> {
  const fetchJourneyEvents: CachedFetcher<Vehicles[]> = async () => {
    const events = await getJourneyEvents()

    if (events.length === 0) {
      return false
    }

    return events.filter((pos) => !!pos.lat && !!pos.long && !!pos.journey_start_time)
  }

  const fetchJourneyRoute: CachedFetcher = async () => {
    const routes = await getJourneyRoute()
    const validRoute = filterByDateChains<JoreRoute>({ routes }, departureDate)

    if (!validRoute || validRoute.length === 0) {
      return false
    }

    return validRoute[0]
  }

  const getJourneyDepartures: CachedFetcher = async (journeyRoute) => {
    let routeSegments: RouteSegment[] = get(journeyRoute, 'routeSegments.nodes', []) || []
    routeSegments = filterByDateChains<RouteSegment>({ routeSegments }, departureDate)
    routeSegments = sortBy(routeSegments, 'stopIndex')

    const stops = routeSegments.map(
      (routeSegment): StopSegmentCombo => {
        let stopDepartures = get(routeSegment, 'stop.departures.nodes', [])
        stopDepartures = getValidDepartures(stopDepartures, departureDate)

        return {
          destination: routeSegment.destinationFi || '',
          distanceFromPrevious: routeSegment.distanceFromPrevious,
          distanceFromStart: routeSegment.distanceFromStart,
          duration: routeSegment.duration,
          stopIndex: routeSegment.stopIndex,
          isTimingStop: !!routeSegment.timingStopType,
          ...createStopObject(get(routeSegment, 'stop', {})),
          departures: stopDepartures,
        }
      }
    )

    const firstStopDepartures = get(stops, '[0].departures', [])

    const originDeparture =
      firstStopDepartures.find(
        ({ hours, minutes, dayType, dateBegin, dateEnd, isNextDay }) =>
          getDepartureTime({ hours, minutes, isNextDay }) === departureTime
      ) || null

    if (!originDeparture) {
      return false
    }

    return stops.map((stop) => {
      const departure = stop.departures.filter(
        (dep) => dep.departureId === originDeparture.departureId
      )[0]

      return createPlannedDepartureObject(departure, stop, departureDate)
    })
  }

  const fetchAndProcessJourney = async () => {
    let journeyEvents = await fetchJourneyEvents()

    const vehicleGroups = Object.values(
      groupBy(journeyEvents || null, 'unique_vehicle_id')
    )

    journeyEvents = vehicleGroups[instance]

    if (!journeyEvents || journeyEvents.length === 0) {
      return false
    }

    const events: Vehicles[] = journeyEvents

    const routeCacheKey = `journey_route_${createJourneyId({
      routeId,
      direction,
      departureDate,
      departureTime,
    })}`

    const journeyRoute = await cacheFetch<JoreRoute>(
      routeCacheKey,
      fetchJourneyRoute,
      24 * 60 * 60
    )

    const departuresCacheKey = 'departures_' + routeCacheKey

    const plannedDepartures = await cacheFetch<PlannedDeparture[]>(
      departuresCacheKey,
      () => getJourneyDepartures(journeyRoute),
      24 * 60 * 60
    )

    if (!plannedDepartures || plannedDepartures.length === 0) {
      return createJourneyObject(events, null, [], null, instance)
    }

    const observedDepartures: Departure[] = plannedDepartures.map(
      (departure: PlannedDeparture): Departure => {
        const stopEvents = orderBy(
          events.filter((pos) => pos.next_stop_id === departure.stopId),
          'received_at_unix',
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

    return createJourneyObject(events, journeyRoute, observedDepartures, null, instance)
  }

  const journeyCacheKey = `journey_${createJourneyId({
    routeId,
    direction,
    departureDate,
    departureTime,
  })}`

  const journey = await cacheFetch<Journey>(journeyCacheKey, fetchAndProcessJourney, 60)

  if (!journey) {
    return null
  }

  return journey
}
