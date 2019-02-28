import { createJourneyId } from '../../utils/createJourneyId'
import { Vehicles } from '../../types/generated/hfp-types'
import { createUniqueVehicleId } from '../../utils/createUniqueVehicleId'
import { Journey } from '../../types/generated/schema-types'
import { createJourneyEventObject } from './createJourneyEventObject'

export function createJourneyObject(
  journeyEvents: Vehicles[],
  instance: number
): Journey {
  const journey = journeyEvents[0]

  return {
    id: createJourneyId(journey),
    routeId: journey.route_id,
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
    // @ts-ignore
    name: journeyRoute.nameFi,
    // @ts-ignore
    equipment: null,
    events: journeyEvents.map(createJourneyEventObject),
    departures: [],
  }
}
