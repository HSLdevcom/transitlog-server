import { createJourneyId } from '../../utils/createJourneyId'
import { createUniqueVehicleId } from '../../utils/createUniqueVehicleId'
import {
  Alert,
  Cancellation,
  Departure,
  Journey,
  JourneyEvent,
  JourneyStopEvent,
  Route,
} from '../../types/generated/schema-types'
import {
  createJourneyEventObject,
  createVehiclePositionObject,
} from './createJourneyEventObject'
import { get } from 'lodash'
import { createEquipmentObject } from './createEquipmentObject'
import { JoreEquipment } from '../../types/Jore'
import { getJourneyStartTime } from '../../utils/time'
import { getDirection } from '../../utils/getDirection'
import { getLatestCancellationState } from '../../utils/getLatestCancellationState'
import { Vehicles } from '../../types/EventsDb'

export function createJourneyObject(
  vehiclePositions: Vehicles[],
  events: Array<JourneyEvent | JourneyStopEvent>,
  journeyRoute?: Route | null,
  originDeparture: Departure | null = null,
  journeyEquipment?: JoreEquipment | null,
  alerts: Alert[] = [],
  cancellations: Cancellation[] = []
): Journey {
  const journey = vehiclePositions[0]

  const departureDate = get(originDeparture, 'plannedDepartureTime.departureDate', '')
  const departureTime = !journey
    ? get(originDeparture, 'plannedDepartureTime.departureTime', '')
    : getJourneyStartTime(journey)

  const id = !journey
    ? `journey_no_events_${get(originDeparture, 'id')}`
    : createJourneyId(journey)

  const isCancelled =
    cancellations.length !== 0 && getLatestCancellationState(cancellations)[0].isCancelled

  return {
    id,
    lineId: get(journeyRoute, 'lineId', ''),
    routeId: get<Vehicles, any, string>(journey, 'route_id', get(journeyRoute, 'routeId', '')),
    originStopId: get(journeyRoute, 'originStopId', ''),
    direction: getDirection(
      get(
        journey,
        'direction_id',
        get(originDeparture, 'direction', get(journeyRoute, 'direction', 0))
      )
    ),
    departureDate: get(journey, 'oday', departureDate),
    departureTime,
    uniqueVehicleId: !journey
      ? ''
      : createUniqueVehicleId(journey.owner_operator_id, journey.vehicle_number),
    operatorId: !journey ? '' : journey.owner_operator_id + '',
    vehicleId: !journey ? '' : journey.vehicle_number + '',
    headsign: !journey ? '' : journey.headsign,
    name: get(journeyRoute, 'name', ''),
    mode: (get(journeyRoute, 'mode', get(journey, 'mode', '')) || '').toUpperCase(),
    equipment: journeyEquipment ? createEquipmentObject(journeyEquipment) : null,
    vehiclePositions: vehiclePositions.map((event) => createVehiclePositionObject(event, id)),
    events,
    departure: originDeparture,
    alerts,
    cancellations,
    isCancelled,
  }
}
