import { Alert, VehicleJourney } from '../../types/generated/schema-types'
import { createJourneyId } from '../../utils/createJourneyId'
import { getDirection } from '../../utils/getDirection'
import get from 'lodash/get'
import { createUniqueVehicleId } from '../../utils/createUniqueVehicleId'
import { TZ } from '../../constants'
import {
  getDateFromDateTime,
  getJourneyEventTime,
  getJourneyStartTime,
} from '../../utils/time'
import moment from 'moment-timezone'
import { Vehicles } from '../../types/EventsDb'

export const createVehicleJourneyObject = (
  event: Vehicles,
  alerts: Alert[] = []
): VehicleJourney => {
  const observedDepartureTime = moment.tz(event.tst, TZ)
  const departureTime = getJourneyStartTime(event)
  const journeyDate = moment.tz(event.tst, TZ).format('YYYY-MM-DD')
  const departureDate = get(event, 'oday', journeyDate) || journeyDate

  const plannedDepartureTime = getDateFromDateTime(departureDate, getJourneyStartTime(event))
  const departureDiff = observedDepartureTime.diff(plannedDepartureTime, 'seconds')

  return {
    id: createJourneyId(event),
    journeyType:
      event.journey_type ||
      (typeof event.journey_start_time === 'undefined' ? 'deadrun' : 'journey'),
    routeId: get(event, 'route_id', '') || '',
    direction: getDirection(event.direction_id),
    originStopId: get(event, 'next_stop_id', ''), // TODO: get the correct one
    departureDate,
    departureTime,
    uniqueVehicleId: createUniqueVehicleId(event.owner_operator_id, event.vehicle_number),
    operatorId: get(event, 'owner_operator_id', '') + '',
    vehicleId: get(event, 'vehicle_number', '') + '',
    headsign: get(event, 'headsign', ''),
    mode: get(event, 'mode', 'BUS'),
    recordedAt: observedDepartureTime.toISOString(true),
    recordedAtUnix: parseInt(event.tsi, 10),
    recordedTime: getJourneyEventTime(event),
    timeDifference: departureDiff,
    nextStopId: get(event, 'next_stop_id', '') || '',
    alerts,
    cancellations: [],
    isCancelled: false,
  }
}
