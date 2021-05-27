import { Scalars, VehicleJourney } from '../types/generated/schema-types'
import { CachedFetcher } from '../types/CachedFetcher'
import { cacheFetch } from '../cache'
import { createVehicleJourneyObject } from '../objects/createVehicleJourneyObject'
import { isToday, isWithinRange } from 'date-fns'
import { Vehicles } from '../types/EventsDb'
import { AuthenticatedUser } from '../types/Authentication'
import { requireVehicleAuthorization } from '../auth/requireUser'
import { compact, groupBy, map, orderBy } from 'lodash'
import { findJourneyStartEvent } from '../utils/findJourneyStartEvent'
import { getStopDepartureEvent } from '../utils/getStopDepartureData'

export const createVehicleJourneysResponse = async (
  user: AuthenticatedUser,
  getVehicleJourneys: () => Promise<Vehicles[] | null>,
  getAlerts,
  uniqueVehicleId: Scalars['VehicleId'],
  date: string,
  skipCache = false
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

    let originDepartureEvent = Object.values(
      groupBy(departureEvents, (evt: Vehicles) =>
        // @ts-ignore the object is NOT possibly null.
        evt !== null ? evt.journey_start_time + evt.route_id : ''
      )
    ).map((departureGroup) => {
      const firstStopId = departureGroup[0].stop
      let firstStopEvents = departureGroup.filter((evt) => evt.stop === firstStopId)

      let firstStopDeparture = getStopDepartureEvent(firstStopEvents, true)

      if (!firstStopDeparture) {
        return orderBy(firstStopEvents, 'tsi', 'desc')[0]
      }

      return firstStopDeparture
    })

    const alerts = await getAlerts(date, { allRoutes: true, route: true })

    return orderBy(originDepartureEvent, 'tsi', 'asc').map((event) => {
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
  const journeys = await cacheFetch<VehicleJourney[]>(
    cacheKey,
    fetchJourneys,
    cacheTTL,
    skipCache
  )

  if (!journeys) {
    return []
  }

  return journeys
}
