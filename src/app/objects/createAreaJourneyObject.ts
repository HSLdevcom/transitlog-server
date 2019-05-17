import { Vehicles } from '../../types/generated/hfp-types'
import { Alert, AreaJourney } from '../../types/generated/schema-types'
import { createJourneyId } from '../../utils/createJourneyId'
import { getDirection } from '../../utils/getDirection'
import get from 'lodash/get'
import { createUniqueVehicleId } from '../../utils/createUniqueVehicleId'
import { getJourneyStartTime } from '../../utils/time'
import { createJourneyEventObject } from './createJourneyEventObject'

export const createAreaJourneyObject = (events: Vehicles[], alerts: Alert[] = []): AreaJourney => {
  const journey = events[0]
  const departureTime = getJourneyStartTime(journey)
  const departureDate = get(journey, 'oday')
  const id = createJourneyId(journey)

  return {
    id,
    routeId: get(journey, 'route_id', '') || '',
    direction: getDirection(journey.direction_id),
    departureDate,
    departureTime,
    uniqueVehicleId: createUniqueVehicleId(journey.owner_operator_id, journey.vehicle_number),
    operatorId: get(journey, 'owner_operator_id', ''),
    vehicleId: get(journey, 'vehicle_number', '') + '',
    headsign: get(journey, 'headsign', ''),
    mode: get(journey, 'mode', 'BUS'),
    events: events.map((event) => createJourneyEventObject(event, id)),
    alerts,
    cancellations: [],
    isCancelled: false,
  }
}
