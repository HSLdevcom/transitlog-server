import { get } from 'lodash'
import { getDirection } from './getDirection'
import { createValidVehicleId } from './createUniqueVehicleId'
import { getJourneyStartTime } from './time'
import { Journey } from '../types/Journey'

export const createJourneyId = (journeyObject: Journey | null) => {
  if (!journeyObject) {
    return ''
  }

  const departureDate = get(journeyObject, 'oday', get(journeyObject, 'departureDate', null))
  const routeId = get(journeyObject, 'route_id', get(journeyObject, 'routeId', null))
  const departureTime = getJourneyStartTime(journeyObject)

  const direction = getDirection(
    get(journeyObject, 'direction_id', get(journeyObject, 'direction', null))
  )

  const uniqueVehicleId = createValidVehicleId(
    get(journeyObject, 'unique_vehicle_id', get(journeyObject, 'uniqueVehicleId', ''))
  )

  if (!routeId || !direction || !departureDate || !departureTime) {
    return ''
  }

  if (!uniqueVehicleId) {
    return `${departureDate}_${departureTime}_${routeId}_${direction}`
  }

  return `${departureDate}_${departureTime}_${routeId}_${direction}_${uniqueVehicleId}`
}
