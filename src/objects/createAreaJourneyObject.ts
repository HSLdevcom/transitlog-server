import { Alert, Journey } from '../types/generated/schema-types'
import { createJourneyId } from '../utils/createJourneyId'
import { getDirection } from '../utils/getDirection'
import get from 'lodash/get'
import { createUniqueVehicleId } from '../utils/createUniqueVehicleId'
import { getJourneyStartTime } from '../utils/time'
import { createVehiclePositionObject } from './createJourneyEventObject'
import { Vehicles } from '../types/EventsDb'
import moment from 'moment-timezone'
import { TZ } from '../constants'

export const createAreaJourneyObject = (events: Vehicles[], alerts: Alert[] = []): Journey => {
  const journey = events[0]
  const departureTime = getJourneyStartTime(journey)
  const journeyDate = moment.tz(journey.tst, TZ).format('YYYY-MM-DD')
  const departureDate = get(journey, 'oday', journeyDate) || journeyDate

  const id =
    journey.journey_type === 'journey'
      ? `area_journey_${createJourneyId(journey)}`
      : `area_journey_${journey.journey_type}_${journey.unique_vehicle_id}`

  return {
    id,
    journeyType:
      get(journey, 'journey_type', '') ||
      (typeof journey.journey_start_time === 'undefined' ? 'deadrun' : 'journey'),
    routeId: get(journey, 'route_id', null) || null,
    direction: journey.direction_id ? getDirection(journey.direction_id) : null,
    departureDate,
    departureTime: departureTime || null,
    uniqueVehicleId: createUniqueVehicleId(journey.owner_operator_id, journey.vehicle_number),
    operatorId: get(journey, 'owner_operator_id', '') + '',
    vehicleId: get(journey, 'vehicle_number', '') + '',
    headsign: get(journey, 'headsign', ''),
    mode: get(journey, 'mode', 'BUS'),
    vehiclePositions: events.map((event) => createVehiclePositionObject(event, id)),
    events: [],
    alerts,
    cancellations: [],
    isCancelled: false,
  }
}
