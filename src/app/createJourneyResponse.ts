import { Route as JoreRoute, RouteSegment } from '../types/generated/jore-types'
import { cacheFetch } from './cache'
import { Vehicles } from '../types/generated/hfp-types'
import { Direction, Journey } from '../types/generated/schema-types'
import { createJourneyId } from '../utils/createJourneyId'
import { filterByDateChains } from '../utils/filterByDateChains'
import { groupBy, get, sortBy, omit } from 'lodash'
import { createJourneyObject } from './objects/createJourneyObject'
import { isWithinRange } from '../utils/isWithinRange'

export async function createJourneyResponse(
  getJourneyRoute: () => Promise<JoreRoute[]>,
  getJourneyEvents: () => Promise<Vehicles[]>,
  routeId: string,
  direction: Direction,
  departureDate: string,
  departureTime: string,
  instance: number = 0
): Promise<Journey[]> {
  const fetchJourneyRoute = async () => {
    const routes = await getJourneyRoute()

    if (!routes) {
      return false
    }

    const validRoute = filterByDateChains<JoreRoute>({ routes }, departureDate)[0] || null

    if (!validRoute) {
      return false
    }

    let routeSegments: RouteSegment[] = get(validRoute, 'routeSegments.nodes', []) || []
    routeSegments = filterByDateChains<RouteSegment>({ routeSegments }, departureDate)

    routeSegments = sortBy(routeSegments, 'stopIndex')

    const originDeparture =
      get(routeSegments, '[0].stop.departures.nodes', []).find(
        ({ hours, minutes, dayType, dateBegin, dateEnd, isNextDay }) =>
          departureTime({ hours, minutes, isNextDay }) === journeyStartTime &&
          isWithinRange(departureDate, dateBegin, dateEnd)
      ) || null

    // TODO: all this

    const stops = routeSegments.map((routeSegment) => {
      const departure = filterDepartures(
        get(routeSegment, 'stop.departures.nodes', []),
        date
      ).filter((departure) => departure.departureId === originDeparture.departureId)[0]

      const stopEvents = orderBy(
        events.filter((pos) => pos.next_stop_id === routeSegment.stopId),
        'received_at_unix',
        'desc'
      )

      const stopArrival = departure ? stopArrivalTimes(stopEvents, departure, date) : null

      const stopDeparture = departure
        ? stopDepartureTimes(stopEvents, departure, date)
        : null

      return {
        destination: routeSegment.destinationFi,
        distanceFromPrevious: routeSegment.distanceFromPrevious,
        distanceFromStart: routeSegment.distanceFromStart,
        duration: routeSegment.duration,
        stopIndex: routeSegment.stopIndex,
        timingStopType: routeSegment.timingStopType,
        ...omit(get(routeSegment, 'stop', {}), 'departures', '__typename'),
        departure,
        ...stopDeparture,
        ...stopArrival,
      }
    })
  }

  const fetchJourneyEvents = async () => {
    const events = await getJourneyEvents()

    if (events.length === 0) {
      return false
    }

    return events.filter((pos) => !!pos.lat && !!pos.long && !!pos.journey_start_time)
  }

  const routeCacheKey = `journey_route_${createJourneyId({
    routeId,
    direction,
    departureDate,
    departureTime,
  })}`

  const eventsCacheKey = `journey_events_${createJourneyId({
    routeId,
    direction,
    departureDate,
    departureTime,
  })}`

  const journeyRouteOption = await cacheFetch<JoreRoute>(
    routeCacheKey,
    fetchJourneyRoute,
    24 * 60 * 60
  )

  const journeyRoute = journeyRouteOption ? journeyRouteOption[0] : null

  let journeyEvents = await cacheFetch<Vehicles>(eventsCacheKey, fetchJourneyEvents, 5)

  if (!journeyEvents || journeyEvents.length === 0) {
    return []
  }

  const vehicleGroups = Object.values(groupBy(journeyEvents, 'unique_vehicle_id'))

  if (vehicleGroups.length > 1) {
    journeyEvents = vehicleGroups[instance]
  }

  const journeyItem = createJourneyObject(journeyEvents, instance)
}
