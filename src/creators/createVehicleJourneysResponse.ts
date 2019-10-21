import { VehicleId, VehicleJourney } from '../types/generated/schema-types'
import { CachedFetcher } from '../types/CachedFetcher'
import { cacheFetch } from '../cache'
import { createVehicleJourneyObject } from '../objects/createVehicleJourneyObject'
import { isToday, isWithinRange } from 'date-fns'
import { Vehicles } from '../types/EventsDb'
import { AuthenticatedUser } from '../types/Authentication'
import { requireVehicleAuthorization } from '../auth/requireUser'
import { compact, map, groupBy, orderBy } from 'lodash'
import { findJourneyStartEvent } from '../utils/findJourneyStartEvent'

export const createVehicleJourneysResponse = async (
  getVehicleJourneys: () => Promise<Vehicles[] | null>,
  getAlerts,
  uniqueVehicleId: VehicleId,
  date: string,
  user: AuthenticatedUser
): Promise<VehicleJourney[]> => {
  const fetchJourneys: CachedFetcher<VehicleJourney[]> = async () => {
    const vehicleJourneys = await getVehicleJourneys()

    if (!vehicleJourneys || vehicleJourneys.length === 0) {
      return false
    }

    let departureEvents: Vehicles[] = vehicleJourneys

    if (vehicleJourneys.some((evt) => evt.event_type === 'VP')) {
      departureEvents = compact(
        map(
          groupBy(orderBy(vehicleJourneys, 'journey_start_time'), 'journey_start_time'),
          findJourneyStartEvent
        )
      )
    }

    const alerts = await getAlerts(date, { allRoutes: true, route: true })

    return departureEvents.map((event) => {
      const journeyAlerts = alerts.filter((alert) => {
        if (!isWithinRange(event.tst, alert.startDateTime, alert.endDateTime)) {
          return false
        }

        return alert.affectedId === event.route_id
      })

      return createVehicleJourneyObject(event, journeyAlerts)
    })
  }

  if (!requireVehicleAuthorization(user, uniqueVehicleId)) {
    return []
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
