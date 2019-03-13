import { CachedFetcher } from '../types/CachedFetcher'
import { get, groupBy, orderBy } from 'lodash'
import { filterByDateChains } from '../utils/filterByDateChains'
import {
  Departure as JoreDeparture,
  RouteSegment as JoreRouteSegment,
  Stop as JoreStop,
} from '../types/generated/jore-types'
import { Departure, DepartureFilterInput, DepartureStop } from '../types/generated/schema-types'
import { Vehicles } from '../types/generated/hfp-types'
import { cacheFetch } from './cache'
import { createDepartureId, createPlannedDepartureObject } from './objects/createDepartureObject'
import { createStopObject } from './objects/createStopObject'
import { getDirection } from '../utils/getDirection'
import { getDepartureTime, getJourneyStartTime } from '../utils/time'
import { getStopDepartureData } from '../utils/getStopDepartureData'
import { filterDepartures } from './filters/filterDepartures'

export async function createDeparturesResponse(
  getDepartures: () => Promise<JoreDeparture | null>,
  getStop: () => Promise<JoreStop | null>,
  getEvents: () => Promise<Vehicles[]>,
  stopId: string,
  date: string,
  filters: DepartureFilterInput
) {
  const fetchStops: CachedFetcher<DepartureStop[]> = async () => {
    const stop = await getStop()

    if (!stop) {
      return false
    }

    const stopObject = createStopObject(stop)

    const groupedRouteSegments = groupBy(
      get(stop, 'routeSegments.nodes', []),
      (segment) => segment.routeId + segment.direction + segment.stopIndex
    )

    const validSegments = filterByDateChains<JoreRouteSegment>(groupedRouteSegments, date)

    return validSegments.map((segment) => ({
      destination: segment.destinationFi || '',
      distanceFromPrevious: segment.distanceFromPrevious,
      distanceFromStart: segment.distanceFromStart,
      duration: segment.duration,
      stopIndex: segment.stopIndex,
      isTimingStop: !!segment.timingStopType,
      routeId: segment.routeId,
      direction: getDirection(segment.direction),
      ...stopObject,
    }))
  }

  const fetchDepartures: CachedFetcher<Departure[]> = async () => {
    const stopsPromise = fetchStops()
    const departuresPromise = getDepartures()

    const [stops, departures] = await Promise.all([stopsPromise, departuresPromise])

    if (!stops || !departures) {
      return false
    }

    const groupedDepartures = groupBy(departures, createDepartureId)
    const validDepartures = filterByDateChains<JoreDeparture>(groupedDepartures, date)

    return validDepartures.map((departure) => {
      const stop = stops.find((stopSegment) => {
        return (
          stopSegment.routeId === departure.routeId &&
          stopSegment.direction === getDirection(departure.direction)
        )
      })

      return createPlannedDepartureObject(departure, stop || null, date)
    })
  }

  const fetchEvents: CachedFetcher<Vehicles[]> = async () => {
    const events = await getEvents()

    if (!events || events.length === 0) {
      return false
    }

    return events
  }

  const departuresCacheKey = `departures_${stopId}_${date}`
  const validDepartures = await cacheFetch<Departure[]>(
    departuresCacheKey,
    fetchDepartures,
    24 * 60 * 60
  )

  if (!validDepartures) {
    return []
  }

  const eventsCacheKey = `departure_events_${stopId}_${date}`
  const departureEvents = await cacheFetch<Vehicles[]>(eventsCacheKey, fetchEvents, 5)

  const filteredDepartures = filterDepartures(validDepartures, filters)

  if (!departureEvents || departureEvents.length === 0) {
    return filteredDepartures
  }

  return filteredDepartures.map((departure) => {
    const originDepartureTime = get(departure, 'originDepartureTime.departureTime', null)

    if (!originDepartureTime) {
      return departure
    }

    const departureIsNextDay = get(departure, 'originDepartureTime.isNextDay', false)
    const routeId = get(departure, 'routeId', '')
    const direction = parseInt(get(departure, 'direction', '0'), 10)

    const eventsForDeparture = departureEvents.filter(
      (event) =>
        event.route_id === routeId &&
        event.direction_id === direction &&
        getJourneyStartTime(event, departureIsNextDay) === originDepartureTime
    )

    const stopDeparture = departure
      ? getStopDepartureData(orderBy(eventsForDeparture, 'tsi', 'desc'), departure, date)
      : null

    return {
      ...departure,
      observedDepartureTime: stopDeparture,
    }
  })
}
