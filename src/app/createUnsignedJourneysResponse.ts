import { CachedFetcher } from '../types/CachedFetcher'
import { cacheFetch } from './cache'
import { createVehicleJourneyObject } from './objects/createVehicleJourneyObject'
import { groupBy, map, orderBy } from 'lodash'
import { isToday, isWithinRange } from 'date-fns'
import { Vehicles } from '../types/EventsDb'
import { VehicleJourney } from '../types/generated/schema-types'

export const createUnsignedJourneysResponse = async (
  getUnsignedJourneys: () => Promise<Vehicles[] | null>,
  getAlerts,
  date: string
): Promise<VehicleJourney[]> => {
  const fetchJourneys: CachedFetcher<VehicleJourney[]> = async () => {
    const unsignedJourneys = await getUnsignedJourneys()

    if (!unsignedJourneys || unsignedJourneys.length === 0) {
      return false
    }

    const unsignedJourneyEvents: { [vehicleId: string]: Vehicles[] } = groupBy(
      orderBy(unsignedJourneys, 'tsi'),
      'unique_vehicle_is'
    )

    const alerts = await getAlerts(date, { allRoutes: true })

    return map(unsignedJourneyEvents, (journeyEvents) => {
      const journey = journeyEvents[0]

      const journeyAlerts = alerts.filter((alert) =>
        isWithinRange(journey.tst, alert.startDateTime, alert.endDateTime)
      )

      return createVehicleJourneyObject(journey, journeyAlerts)
    })
  }

  // Cache events for the current day for 5 seconds, otherwise 24 hours.
  const cacheTTL: number = 1 // isToday(date) ? 5 : 24 * 60 * 60

  const cacheKey = `unsigned_journeys_${date}`
  const journeys = await cacheFetch<VehicleJourney[]>(cacheKey, fetchJourneys, cacheTTL)

  if (!journeys) {
    return []
  }

  return journeys
}
