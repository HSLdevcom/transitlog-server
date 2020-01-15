import { DriverEvent, Scalars } from '../types/generated/schema-types'
import { CachedFetcher } from '../types/CachedFetcher'
import { cacheFetch } from '../cache'
import { isToday } from 'date-fns'
import { Vehicles } from '../types/EventsDb'
import { AuthenticatedUser } from '../types/Authentication'
import { requireVehicleAuthorization } from '../auth/requireUser'
import { createDriverEventObject } from '../objects/createJourneyEventObject'
import { uniqBy } from 'lodash'

export const createDriverEventsResponse = async (
  user: AuthenticatedUser,
  getDriverEvents: () => Promise<Vehicles[]>,
  uniqueVehicleId: Scalars['VehicleId'],
  date: string,
  skipCache = false
): Promise<DriverEvent[]> => {
  const fetchEvents: CachedFetcher<DriverEvent[]> = async () => {
    const driverEvents = await getDriverEvents()

    if (!driverEvents || driverEvents.length === 0) {
      return false
    }

    return uniqBy(driverEvents.map(createDriverEventObject), 'id')
  }

  if (!requireVehicleAuthorization(user, uniqueVehicleId)) {
    return []
  }

  // Cache events for the current day for 5 seconds, otherwise 24 hours.
  const cacheTTL: number = isToday(date) ? 5 : 24 * 60 * 60

  const cacheKey = `driver_events_${uniqueVehicleId}_${date}`
  const events = await cacheFetch<DriverEvent[]>(cacheKey, fetchEvents, cacheTTL, skipCache)

  if (!events) {
    return []
  }

  return events
}
