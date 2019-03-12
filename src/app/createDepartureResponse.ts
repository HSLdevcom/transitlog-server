import { CachedFetcher } from '../types/CachedFetcher'
import { groupBy, get } from 'lodash'
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

export async function createDeparturesResponse(
  getDepartures: () => Promise<JoreDeparture | null>,
  getStop: () => Promise<JoreStop | null>,
  getEvents: (departure: JoreDeparture) => Promise<Vehicles[]>,
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

    // TODO: Group route segments

    const validSegments = filterByDateChains<JoreRouteSegment>(
      get(stop, 'routeSegments.nodes', []),
      date
    )

    return validSegments.map((segment) => ({
      destination: segment.destinationFi || '',
      distanceFromPrevious: segment.distanceFromPrevious,
      distanceFromStart: segment.distanceFromStart,
      duration: segment.duration,
      stopIndex: segment.stopIndex,
      isTimingStop: !!segment.timingStopType,
      ...stopObject,
    }))
  }

  const fetchDepartures: CachedFetcher<Departure[]> = async (stops) => {
    const departures = await getDepartures()

    if (!departures) {
      return false
    }

    const groupedDepartures = groupBy(departures, createDepartureId)
    const validDepartures = filterByDateChains<JoreDeparture>(groupedDepartures, date)

    return validDepartures.map((departure) => {
      const stop = stops.find(
        (stop) => stop.routeId === departure.routeId && stop.direction === departure.direction
      )

      return createPlannedDepartureObject(departure, stop, date)
    })
  }

  const stopsCacheKey = `stops_${stopId}_${date}`
  const stops = await cacheFetch<DepartureStop[]>(stopsCacheKey, fetchStops, 1)

  const departuresCacheKey = `departures_${stopId}_${date}`
  const validDepartures = await cacheFetch<Departure[]>(
    departuresCacheKey,
    () => fetchDepartures(stops),
    1
  )

  if (!validDepartures) {
    return []
  }

  return validDepartures
}
