import { CachedFetcher } from '../types/CachedFetcher'
import { groupBy, get } from 'lodash'
import { filterByDateChains } from '../utils/filterByDateChains'
import { Departure as JoreDeparture } from '../types/generated/jore-types'
import { DepartureFilterInput } from '../types/generated/schema-types'
import { Vehicles } from '../types/generated/hfp-types'
import { cacheFetch } from './cache'
import { createDepartureId } from './objects/createDepartureObject'

export async function createDeparturesResponse(
  getDepartures: () => Promise<JoreDeparture | null>,
  getEvents: (departure: JoreDeparture) => Promise<Vehicles[]>,
  stopId: string,
  date: string,
  filters: DepartureFilterInput
) {
  const fetchAndValidate: CachedFetcher<JoreDeparture[]> = async () => {
    const departures = await getDepartures()

    if (!departures) {
      return false
    }

    const groupedDepartures = groupBy(departures, createDepartureId)
    const validDepartures = filterByDateChains<JoreDeparture>(groupedDepartures, date)

    const departureObjects = validDepartures.map((departure) => {
      const {
        routeSegments: { nodes: routeSegments = [] },
        ...stop
      } = get(departure, 'stop', { routeSegments: { nodes: [] } })

      const groupedRouteSegments = groupBy(
        routeSegments,
        (segment) => segment.routeId + segment.direction + segment.stopIndex
      )
    })

    return []
  }

  const cacheKey = `departures_${stopId}_${date}`
  const validDepartures = await cacheFetch<JoreDeparture[]>(cacheKey, fetchAndValidate)

  if (!validDepartures) {
    return []
  }

  return validDepartures
}
