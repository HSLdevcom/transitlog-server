import { createJourneyId } from '../../utils/createJourneyId'
import { Vehicles } from '../../types/generated/hfp-types'
import { createUniqueVehicleId } from '../../utils/createUniqueVehicleId'
import { Departure, Journey, Route } from '../../types/generated/schema-types'
import { createJourneyEventObject } from './createJourneyEventObject'
import { get } from 'lodash'

export function createJourneyObject(
  journeyEvents: Vehicles[],
  journeyRoute?: Route | null,
  journeyDepartures: Departure[] = [],
  journeyEquipment: any = null,
  instance: number = 0
): Journey {
  const journey = journeyEvents[0]

  return {
    id: createJourneyId(journey),
    lineId: get(journeyRoute, 'lineId', ''),
    routeId: get<Vehicles, any, string>(
      journey,
      'route_id',
      get<Route, any, string>(journeyRoute, 'routeId', '')
    ),
    direction: journey.direction_id,
    departureDate: journey.oday,
    departureTime: journey.journey_start_time,
    uniqueVehicleId: createUniqueVehicleId(
      journey.owner_operator_id,
      journey.vehicle_number
    ),
    operatorId: journey.owner_operator_id,
    vehicleId: journey.vehicle_number + '',
    instance,
    headsign: journey.headsign,
    name: get(journeyRoute, 'name', ''),
    equipment: journeyEquipment,
    events: journeyEvents.map(createJourneyEventObject),
    departures: journeyDepartures,
  }
}
