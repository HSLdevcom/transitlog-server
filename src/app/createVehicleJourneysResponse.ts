import { VehicleId, VehicleJourney } from '../types/generated/schema-types'
import { CachedFetcher } from '../types/CachedFetcher'
import { cacheFetch } from './cache'
import { createVehicleJourneyObject } from './objects/createVehicleJourneyObject'
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

    const alerts = await getAlerts(date, { allRoutes: true, route: true })

    return vehicleJourneys.map((event) => {
      const journeyAlerts = alerts.filter((alert) => {
        if (!isWithinRange(event.tst, alert.startDateTime, alert.endDateTime)) {
          return false
        }

        return alert.affectedId === event.route_id
      })

      return createVehicleJourneyObject(event, journeyAlerts)
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
