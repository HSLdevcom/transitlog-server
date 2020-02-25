import { Scalars, Journey } from '../types/generated/schema-types'
import { CachedFetcher } from '../types/CachedFetcher'
import { cacheFetch } from '../cache'
import { isToday } from 'date-fns'
import { groupBy, map, orderBy } from 'lodash'
import { createJourneyObject } from '../objects/createJourneyObject'
import { Vehicles } from '../types/EventsDb'

export const createRouteJourneysResponse = async (
  getJourney: () => Promise<Vehicles[] | null>,
  routeId: string,
  direction: Scalars['Direction'],
  date: string,
  skipCache = false
): Promise<Journey[]> => {
  const fetchAllJourneys: CachedFetcher<Journey[]> = async () => {
    const journeyEvents = await getJourney()

    if (!journeyEvents) {
      return false
    }

    const routeJourneys = journeyEvents.filter(({ lat, long }) => !!lat && !!long)

    if (routeJourneys.length === 0) {
      return false
    }

    const routeGroups = groupBy(
      routeJourneys,
      ({ route_id, direction_id, journey_start_time, unique_vehicle_id }) =>
        `${route_id}_${direction_id}_${journey_start_time}_${unique_vehicle_id}`
    )

    return map(routeGroups, (events) =>
      createJourneyObject(orderBy(events, 'tsi', 'asc'), [], null, null, null)
    )
  }

  const journeysTTL: number = isToday(date) ? 60 : 24 * 60 * 60
  const journeysKey = `route_journeys_${routeId}_${direction}_${date}`

  const journeys = await cacheFetch<Journey[]>(
    journeysKey,
    fetchAllJourneys,
    journeysTTL,
    false
  )

  if (!journeys || journeys.length === 0) {
    return []
  }

  return journeys
}
