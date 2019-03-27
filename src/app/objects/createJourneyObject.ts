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
  journeyEquipment?: JoreEquipment | null
): Journey {
  const journey = journeyEvents[0]
  const firstDeparture = journeyDepartures[0]
  const id = createJourneyId(journey)

  return {
    id,
    lineId: get(journeyRoute, 'lineId', ''),
    routeId: get<Vehicles, any, string>(journey, 'route_id', get(journeyRoute, 'routeId', '')),
    originStopId: get(journeyRoute, 'originStopId', ''),
    direction: journey.direction_id,
    departureDate: journey.oday,
    departureTime: getJourneyStartTime(journey, get(firstDeparture, 'isNextDay') || undefined),
    uniqueVehicleId: createUniqueVehicleId(journey.owner_operator_id, journey.vehicle_number),
    operatorId: journey.owner_operator_id,
    vehicleId: journey.vehicle_number + '',
    headsign: journey.headsign,
    name: get(journeyRoute, 'name', ''),
    mode: get(journeyRoute, 'mode', ''),
    equipment: journeyEquipment ? createEquipmentObject(journeyEquipment) : null,
    events: journeyEvents.map((event) => createJourneyEventObject(event, id)),
    departures: journeyDepartures,
  }
}
