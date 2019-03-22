import { get } from 'lodash'
import { getDirection } from './getDirection'
import { Direction, VehicleId } from '../types/generated/schema-types'
import { intval } from './isWithinRange'
import { createUniqueVehicleId, createValidVehicleId } from './createUniqueVehicleId'

interface HFPJourneyObject {
  oday?: string
  route_id?: string | null
  direction_id?: number
  journey_start_time?: string
  instance?: number
}

interface JourneyObject {
  departureDate: string
  routeId: string
  direction: Direction
  departureTime: string
  uniqueVehicleId: VehicleId
}

type Journey = HFPJourneyObject | JourneyObject

export const createJourneyId = (journeyObject: Journey | null = null) => {
  const departureDate = get(journeyObject, 'oday', get(journeyObject, 'departureDate', null))
  const routeId = get(journeyObject, 'route_id', get(journeyObject, 'routeId', null))
  const departureTime = get(
    journeyObject,
    'journey_start_time',
    get(journeyObject, 'departureTime', null)
  )
  const direction = getDirection(
    get(journeyObject, 'direction_id', get(journeyObject, 'direction', null))
  )

  const uniqueVehicleId = createValidVehicleId(
    get(journeyObject, 'unique_vehicle_id', get(journeyObject, 'uniqueVehicleId', ''))
  )

  if (!routeId || !departureDate || !departureTime || !uniqueVehicleId) {
    return ''
  }

  return `${departureDate}_${departureTime}_${routeId}_${direction}_${uniqueVehicleId}`
}
