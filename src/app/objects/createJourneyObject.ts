import { createJourneyId } from '../../utils/createJourneyId'
import { Vehicles } from '../../types/generated/hfp-types'
import { createUniqueVehicleId } from '../../utils/createUniqueVehicleId'
import { Departure, Journey, Route } from '../../types/generated/schema-types'
import { createJourneyEventObject } from './createJourneyEventObject'
import { get } from 'lodash'
import { createEquipmentObject } from './createEquipmentObject'
import { Equipment as JoreEquipment } from '../../types/generated/jore-types'
import { getJourneyStartTime } from '../../utils/time'

export function createJourneyObject(
  journeyEvents: Vehicles[],
  journeyRoute?: Route | null,
  journeyDepartures: Departure[] = [],
  journeyEquipment?: JoreEquipment | null,
  instance: number = 0
): Journey {
  const journey = journeyEvents[0]
  const firstDeparture = journeyDepartures[0]

  return {
    id: createJourneyId(journey),
    lineId: get(journeyRoute, 'lineId', ''),
    routeId: get<Vehicles, any, string>(journey, 'route_id', get(journeyRoute, 'routeId', '')),
    direction: journey.direction_id,
    departureDate: journey.oday,
    departureTime: getJourneyStartTime(journey, get(firstDeparture, 'isNextDay') || undefined),
    uniqueVehicleId: createUniqueVehicleId(journey.owner_operator_id, journey.vehicle_number),
    operatorId: journey.owner_operator_id,
    vehicleId: journey.vehicle_number + '',
    instance,
    headsign: journey.headsign,
    name: get(journeyRoute, 'name', ''),
    equipment: journeyEquipment ? createEquipmentObject(journeyEquipment) : null,
    events: journeyEvents.map(createJourneyEventObject),
    departures: journeyDepartures,
  }
}
