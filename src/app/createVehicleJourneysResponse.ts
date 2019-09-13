import { VehicleId, VehicleJourney } from '../types/generated/schema-types'
import { CachedFetcher } from '../types/CachedFetcher'
import { cacheFetch } from './cache'
import { createVehicleJourneyObject } from './objects/createVehicleJourneyObject'
import { groupBy, map, orderBy, compact } from 'lodash'
import { findJourneyStartEvent } from '../utils/findJourneyStartEvent'
import { isToday, isWithinRange } from 'date-fns'
import { Vehicles } from '../types/EventsDb'

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

    const alerts = await getAlerts(date, { allRoutes: true, route: true })

    return journeyEvents.map((journey) => {
      const journeyAlerts = alerts.filter((alert) => {
        if (!isWithinRange(journey.tst, alert.startDateTime, alert.endDateTime)) {
          return false
        }

        return alert.affectedId === journey.route_id
      })

      return createVehicleJourneyObject(journey, journeyAlerts)
    })
  }

  // Cache events for the current day for 5 seconds, otherwise 24 hours.
  const cacheTTL: number = isToday(date) ? 5 : 24 * 60 * 60

  const cacheKey = `vehicle_journeys_${uniqueVehicleId}_${date}`
  const journeys = await cacheFetch<VehicleJourney[]>(cacheKey, fetchJourneys, cacheTTL)

  if (!journeys) {
    return []
  }

  return journeys
}
