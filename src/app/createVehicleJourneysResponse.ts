import { VehicleId, VehicleJourney } from '../types/generated/schema-types'
import { Vehicles } from '../types/generated/hfp-types'
import { CachedFetcher } from '../types/CachedFetcher'
import { cacheFetch } from './cache'
import { createVehicleJourneyObject } from './objects/createVehicleJourneyObject'
import { groupBy, map, orderBy, compact } from 'lodash'
import { findJourneyStartEvent } from '../utils/findJourneyStartEvent'

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

  const cacheKey = `vehicle_journeys_${uniqueVehicleId}_${date}`
  const journeys = await cacheFetch<VehicleJourney[]>(cacheKey, fetchJourneys, 5)

  if (!journeys) {
    return []
  }

  return journeys
}
