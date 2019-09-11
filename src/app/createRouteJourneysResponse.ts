import { Direction, Journey } from '../types/generated/schema-types'
import { CachedFetcher } from '../types/CachedFetcher'
import { cacheFetch } from './cache'
import { isToday } from 'date-fns'
import { groupBy, map } from 'lodash'
import { createJourneyObject } from './objects/createJourneyObject'
import { Vehicles } from '../types/EventsDb'

export const createRouteJourneysResponse = async (
  getJourney: () => Promise<Vehicles[] | null>,
  routeId: string,
  direction: Direction,
  date: string
): Promise<Journey[]> => {
  const fetchAllJourneys: CachedFetcher<Journey[]> = async () => {
    const journeyEvents = await getJourney()

    if (!journeyEvents) {
      return false
    }

    const routeJourneys = journeyEvents.filter(
      ({ lat, long, geohash_level }) =>
        !!lat && !!long && (typeof geohash_level === 'number' && geohash_level <= 2)
    )

    if (routeJourneys.length === 0) {
      return false
    }

    const routeGroups = groupBy(
      routeJourneys,
      ({ route_id, direction_id, journey_start_time }) =>
        `${route_id}_${direction_id}_${journey_start_time}`
    )

    return map(routeGroups, (events) => createJourneyObject(events, null, [], null))
  }

  const journeysTTL: number = isToday(date) ? 5 * 60 : 24 * 60 * 60
  const journeysKey = `route_journeys_${routeId}_${direction}_${date}`

  const journeys = await cacheFetch<Journey[]>(journeysKey, fetchAllJourneys, journeysTTL)

  if (!journeys || journeys.length === 0) {
    return []
  }

  return journeys
}
