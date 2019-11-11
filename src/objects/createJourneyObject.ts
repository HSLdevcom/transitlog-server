import { createJourneyId } from '../utils/createJourneyId'
import { createValidVehicleId } from '../utils/createUniqueVehicleId'
import {
  Alert,
  Cancellation,
  Departure,
  Journey,
  JourneyCancellationEvent,
  JourneyEvent,
  JourneyStopEvent,
  PlannedStopEvent,
  Route,
} from '../types/generated/schema-types'
import { createVehiclePositionObject } from './createJourneyEventObject'
import { get } from 'lodash'
import { createEquipmentObject } from './createEquipmentObject'
import { JoreEquipment } from '../types/Jore'
import { getJourneyStartTime } from '../utils/time'
import { getDirection } from '../utils/getDirection'
import { getLatestCancellationState } from '../utils/getLatestCancellationState'
import { Vehicles } from '../types/EventsDb'

export function createJourneyObject(
  vehiclePositions: Vehicles[],
  events: Array<JourneyEvent | JourneyStopEvent | PlannedStopEvent | JourneyCancellationEvent>,
  journeyRoute?: Route | null,
  originDeparture: Departure | null = null,
  departures: Departure[] | null = null,
  journeyEquipment?: JoreEquipment | null,
  alerts: Alert[] = [],
  cancellations: Cancellation[] = []
): Journey {
  const journey =
    vehiclePositions.find((event) => event.journey_type === 'journey') || vehiclePositions[0]

  const departureDate = get(originDeparture, 'plannedDepartureTime.departureDate', '')
  const departureTime = !journey
    ? get(originDeparture, 'plannedDepartureTime.departureTime', '')
    : getJourneyStartTime(journey)

  const id = !journey
    ? `journey_no_events_${get(originDeparture, 'id')}`
    : createJourneyId(journey)

  const isCancelled =
    cancellations.length !== 0 && getLatestCancellationState(cancellations)[0].isCancelled

  const vehicleId = createValidVehicleId(get(journey, 'unique_vehicle_id', ''))
  const [operator = '0000', vehicleNumber = '00'] = vehicleId.split('/')

  return {
    id,
    journeyType: 'journey',
    routeId: get<Vehicles, any, string>(journey, 'route_id', get(journeyRoute, 'routeId', '')),
    originStopId: get(journeyRoute, 'originStopId', ''),
    direction: getDirection(
      get(
        journey,
        'direction_id',
        get(originDeparture, 'direction', get(journeyRoute, 'direction', 1))
      )
    ),
    departureDate: get(journey, 'oday', departureDate),
    departureTime,
    uniqueVehicleId: vehicleId,
    operatorId: operator,
    vehicleId: vehicleNumber,
    headsign: !journey ? '' : journey.headsign,
    name: get(journeyRoute, 'name', ''),
    journeyLength: get(journeyRoute, 'routeLength', 0),
    journeyDurationMinutes: get(journeyRoute, 'routeDurationMinutes', 0),
    mode: (get(journeyRoute, 'mode', get(journey, 'mode', '')) || '').toUpperCase(),
    equipment: journeyEquipment ? createEquipmentObject(journeyEquipment) : null,
    vehiclePositions: vehiclePositions.map((event) => createVehiclePositionObject(event, id)),
    events,
    departure: originDeparture,
    routeDepartures: !!departures && departures.length ? departures : [],
    alerts,
    cancellations,
    isCancelled,
  }
}
