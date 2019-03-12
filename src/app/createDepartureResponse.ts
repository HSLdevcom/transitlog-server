import { CachedFetcher } from '../types/CachedFetcher'
import { get, groupBy } from 'lodash'
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

  const departuresCacheKey = `departures_${stopId}_${date}`
  const validDepartures = await cacheFetch<Departure[]>(departuresCacheKey, fetchDepartures, 5)

  if (!validDepartures) {
    return []
  }

  return validDepartures
}
