import {
  AreaEventsFilterInput,
  DateTime,
  AreaJourney,
  PreciseBBox,
} from '../types/generated/schema-types'
import { CachedFetcher } from '../types/CachedFetcher'
import { cacheFetch } from './cache'
import { groupBy, map } from 'lodash'
import { createAreaJourneyObject } from './objects/createAreaJourneyObject'
import { createBBoxString } from '../utils/createBBoxString'
import { createJourneyId } from '../utils/createJourneyId'
import { Vehicles } from '../types/EventsDb'

export const createAreaJourneysResponse = async (
  getAreaJourneys: () => Promise<Vehicles[] | null>,
  minTime: DateTime,
  maxTime: DateTime,
  bbox: PreciseBBox,
  date: string,
  filters: AreaEventsFilterInput
): Promise<AreaJourney[]> => {
  const fetchJourneys: CachedFetcher<AreaJourney[]> = async () => {
    const areaJourneys = await getAreaJourneys()

    if (!areaJourneys || areaJourneys.length === 0) {
      return false
    }

    return map(groupBy(areaJourneys, createJourneyId), (events: Vehicles[]) =>
      createAreaJourneyObject(events)
    )
  }

  // Cache for when a link containing an area query is shared.
  const cacheKey = `area_journeys_${createBBoxString(bbox)}_${minTime}_${maxTime}_${date}`
  const journeys = await cacheFetch<AreaJourney[]>(cacheKey, fetchJourneys, 10 * 60)

  if (!journeys) {
    return []
  }

  return journeys
}
