import {
  AreaEventsFilterInput,
  DateTime,
  AreaJourney,
  PreciseBBox,
} from '../types/generated/schema-types'
import { Vehicles } from '../types/generated/hfp-types'
import { CachedFetcher } from '../types/CachedFetcher'
import { cacheFetch } from './cache'
import { groupBy, map } from 'lodash'
import { createAreaJourneyObject } from './objects/createAreaJourneyObject'
import { createBBoxString } from '../utils/createBBoxString'

export const createAreaJourneysResponse = async (
  getAreaJourneys: () => Promise<Vehicles[] | null>,
  minTime: DateTime,
  maxTime: DateTime,
  bbox: PreciseBBox,
  filters: AreaEventsFilterInput
): Promise<AreaJourney[]> => {
  const fetchJourneys: CachedFetcher<AreaJourney[]> = async () => {
    const areaJourneys = await getAreaJourneys()

    if (!areaJourneys || areaJourneys.length === 0) {
      return false
    }

    return map(groupBy(areaJourneys, 'journey_start_time'), createAreaJourneyObject)
  }

  const cacheKey = `area_journeys_${createBBoxString(bbox)}_${minTime}_${maxTime}`
  const journeys = await cacheFetch<AreaJourney[]>(cacheKey, fetchJourneys, 10)

  if (!journeys) {
    return []
  }

  return journeys
}