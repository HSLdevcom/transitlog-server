import { VehicleId, VehicleJourney } from '../types/generated/schema-types'
import { CachedFetcher } from '../types/CachedFetcher'
import { cacheFetch } from './cache'
import { createVehicleJourneyObject } from './objects/createVehicleJourneyObject'
import { groupBy, map, orderBy, compact } from 'lodash'
import { findJourneyStartEvent } from '../utils/findJourneyStartEvent'
import { isToday } from 'date-fns'
import { Vehicles } from '../types/EventsDb'
import pMap from 'p-map'

export const createVehicleJourneysResponse = async (
  getVehicleJourneys: () => Promise<Vehicles[] | null>,
  getAlerts,
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

    return journeyEvents.map((journey) => {
      return createVehicleJourneyObject(journey)
    })
  }

  // Cache events for the current day for 5 seconds, otherwise 24 hours.
  const cacheTTL: number = isToday(date) ? 5 : 24 * 60 * 60

  const cacheKey = `vehicle_journeys_${uniqueVehicleId}_${date}`
  const journeys = await cacheFetch<VehicleJourney[]>(cacheKey, fetchJourneys, cacheTTL)

  if (!journeys) {
    return []
  }

  return pMap(journeys, async (journey) => {
    journey.alerts = await getAlerts(journey.recordedAt, {
      allRoutes: true,
      route: journey.routeId,
      stop: journey.nextStopId,
    })

    return journey
  })
}
