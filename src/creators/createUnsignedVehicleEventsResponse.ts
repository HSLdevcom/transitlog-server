import { Scalars, VehiclePosition } from '../types/generated/schema-types'
import { CachedFetcher } from '../types/CachedFetcher'
import { cacheFetch } from '../cache'
import { isToday } from 'date-fns'
import { Vehicles } from '../types/EventsDb'
import { createUnsignedVehiclePositionObject } from '../objects/createJourneyEventObject'
import { requireVehicleAuthorization } from '../auth/requireUser'
import { AuthenticatedUser } from '../types/Authentication'
import { createValidVehicleId } from '../utils/createUniqueVehicleId'
import { orderBy } from 'lodash'

export const createUnsignedVehicleEventsResponse = async (
  getUnsignedEvents: () => Promise<Vehicles[] | null>,
  uniqueVehicleId: Scalars['VehicleId'],
  date: string,
  user: AuthenticatedUser | null,
  skipCache: boolean = false
): Promise<VehiclePosition[]> => {
  if (!user) {
    return []
  }

  const fetchUnsignedEvents: CachedFetcher<Vehicles[]> = async () => {
    const unsignedEvents = await getUnsignedEvents()

    if (!unsignedEvents || unsignedEvents.length === 0) {
      return false
    }

    const validUnsignedEvents = unsignedEvents.filter((evt) => !!evt.lat && !!evt.long)

    if (validUnsignedEvents.length === 0) {
      return false
    }

    return orderBy(validUnsignedEvents, 'tst')
  }

  const vehicleId = createValidVehicleId(uniqueVehicleId)

  if (!requireVehicleAuthorization(user, vehicleId)) {
    return []
  }

  const unsignedKey = `unsigned_events_${vehicleId}_${date}`
  const unsignedResults = await cacheFetch<Vehicles[]>(
    unsignedKey,
    fetchUnsignedEvents,
    isToday(date) ? 30 : 30 * 24 * 60 * 60,
    skipCache
  )

  if (!unsignedResults || unsignedResults.length === 0) {
    return []
  }

  return unsignedResults.map((event) => createUnsignedVehiclePositionObject(event))
}
