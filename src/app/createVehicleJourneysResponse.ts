import { VehicleId, VehicleJourney } from '../types/generated/schema-types'
import { Vehicles } from '../types/generated/hfp-types'
import { CachedFetcher } from '../types/CachedFetcher'
import { cacheFetch } from './cache'
import { createVehicleJourneyObject } from './objects/createVehicleJourneyObject'
import { groupBy, map, orderBy, compact } from 'lodash'
import { findJourneyStartEvent } from '../utils/findJourneyStartEvent'
import { isToday } from 'date-fns'

export const createVehicleJourneysResponse = async (
  getVehicleJourneys: () => Promise<Vehicles[] | null>,
  uniqueVehicleId: VehicleId,
  date: string
): Promise<VehicleJourney[]> => {
  const fetchJourneys: CachedFetcher<VehicleJourney[]> = async () => {
    const vehicleJourneys = await getVehicleJourneys()

    if (!vehicleJourneys || vehicleJourneys.length === 0) {
      return false
    }

    const journeyEvents: Vehicles[] = compact(
      map(
        groupBy(orderBy(vehicleJourneys, 'journey_start_time'), 'journey_start_time'),
        findJourneyStartEvent
      )
    )

    return journeyEvents.map(createVehicleJourneyObject)
  }

  // Cache events for the current day for 60 seconds, otherwise 24 hours.
  const cacheTTL: number = isToday(date) ? 5 : 24 * 60 * 60

  const cacheKey = `vehicle_journeys_${uniqueVehicleId}_${date}`
  const journeys = await cacheFetch<VehicleJourney[]>(cacheKey, fetchJourneys, cacheTTL)

  if (!journeys) {
    return []
  }

  return journeys
}
