import { VehicleId, VehiclePosition } from '../types/generated/schema-types'
import { CachedFetcher } from '../types/CachedFetcher'
import { cacheFetch } from './cache'
import { isToday } from 'date-fns'
import { Vehicles } from '../types/EventsDb'
import { createUnsignedVehiclePositionObject } from './objects/createJourneyEventObject'
import { requireUser } from '../auth/requireUser'
import { AuthenticatedUser } from '../types/Authentication'
import { createUniqueVehicleId, createValidVehicleId } from '../utils/createUniqueVehicleId'

export const createUnsignedVehicleEventsResponse = async (
  getUnsignedEvents: () => Promise<Vehicles[] | null>,
  uniqueVehicleId: VehicleId,
  date: string,
  user: AuthenticatedUser | null
): Promise<VehiclePosition[]> => {
  if (!user) {
    return []
  }

  const fetchUnsignedEvents: CachedFetcher<VehiclePosition[]> = async () => {
    const unsignedEvents = await getUnsignedEvents()

    if (!unsignedEvents || unsignedEvents.length === 0) {
      return false
    }

    const validUnsignedEvents = unsignedEvents.filter((evt) => !!evt.lat && !!evt.long)

    if (validUnsignedEvents.length === 0) {
      return false
    }

    return validUnsignedEvents.map((event) => createUnsignedVehiclePositionObject(event))
  }

  const [operator = ''] = createValidVehicleId(uniqueVehicleId).split('/')
  const operatorGroup = 'op_' + parseInt(operator, 10)
  const unsignedEventsAuthorized = requireUser(user, 'HSL') || requireUser(user, operatorGroup)

  if (!unsignedEventsAuthorized) {
    return []
  }

  const unsignedKey = `unsigned_events_${uniqueVehicleId}_${date}`
  const unsignedResults = await cacheFetch(
    unsignedKey,
    fetchUnsignedEvents,
    isToday(date) ? 30 : 24 * 60 * 60
  )

  if (!unsignedResults || unsignedResults.length === 0) {
    return []
  }

  return unsignedResults
}
