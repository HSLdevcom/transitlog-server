import { get } from 'lodash'
import { getDirection } from './getDirection'
import { createValidVehicleId } from './createUniqueVehicleId'
import { getJourneyStartTime } from './time'
import { Journey } from '../types/Journey'
import { Vehicles } from '../types/EventsDb'
import {
  JourneyEvent,
  JourneyStopEvent,
  VehiclePosition,
} from '../types/generated/schema-types'

export const createJourneyId = (
  journeyObject: Journey | Vehicles | null,
  // Timing event can provide a better timestamp to compare the planned time
  // against if the main event happened at an irregular time.
  timingEvent: JourneyEvent | JourneyStopEvent | VehiclePosition | null = null
) => {
  if (!journeyObject) {
    return ''
  }

  const departureDate = get(journeyObject, 'oday', get(journeyObject, 'departureDate', null))
  const routeId = get(journeyObject, 'route_id', get(journeyObject, 'routeId', null))
  const departureTime = getJourneyStartTime(journeyObject, timingEvent)

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
