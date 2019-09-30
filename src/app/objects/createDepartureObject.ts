import {
  JoreDeparture,
  JoreDepartureWithOrigin,
  JoreOriginDeparture,
  JoreRouteDepartureData,
  Mode,
} from '../../types/Jore'
import {
  Alert,
  Departure,
  DepartureJourney,
  PlannedArrival,
  PlannedDeparture,
  Stop,
} from '../../types/generated/schema-types'
import { getDateFromDateTime, getDepartureTime, getJourneyStartTime } from '../../utils/time'
import { createJourneyId } from '../../utils/createJourneyId'
import { createValidVehicleId } from '../../utils/createUniqueVehicleId'
import { get } from 'lodash'
import { getDirection } from '../../utils/getDirection'
import { doubleDigit } from '../../utils/doubleDigit'
import { Vehicles } from '../../types/EventsDb'
import { TZ } from '../../constants'
import moment from 'moment-timezone'

function createJoreDepartureId(departure: JoreDeparture, date) {
  return `${departure.route_id}_${departure.direction}_${doubleDigit(
    departure.hours
  )}_${doubleDigit(departure.minutes)}_${departure.stop_id}_${departure.day_type}_${
    departure.extra_departure
  }_${date}_${departure.date_begin}_${departure.date_end}`
}

export function createDepartureId(departure, date = '') {
  if (typeof departure.hours !== 'undefined') {
    return createJoreDepartureId(departure, date)
  }

  return departure.id
}

export function createPlannedArrivalTimeObject(
  departure: JoreDeparture,
  date
): PlannedArrival {
  const arrivalTime = getDepartureTime(departure, true)
  const departureId = createDepartureId(departure)

  return {
    id: `pat_${departureId}_${arrivalTime}_${date}`, // pat = Planned Arrival Time
    arrivalDate: date,
    arrivalTime,
    arrivalDateTime: getDateFromDateTime(date, arrivalTime).toISOString(true),
    isNextDay: departure.arrival_is_next_day,
  }
}

export function createPlannedDepartureTimeObject(
  departure: JoreDeparture | JoreOriginDeparture,
  date: string
): PlannedDeparture {
  const departureTime = getDepartureTime(departure)
  const departureId = createDepartureId(departure)
  const departureDateTime = getDateFromDateTime(date, departureTime).toISOString(true)

  return {
    id: `pdt_${departureId}_${departureTime}_${date}`, // pdt = Planned Departure Time
    departureDate: date,
    departureTime,
    departureDateTime,
    isNextDay: departure.is_next_day,
  }
}

export function createDepartureJourneyObject(
  events: Vehicles | Vehicles[],
  departureIsNextDay: boolean,
  originStopId: string,
  instanceIndex: number = 0,
  mode = Mode.Bus,
  alerts: Alert[] = []
): DepartureJourney {
  const event = events[0] || events
  const id = createJourneyId(event)
  const journeyDate = moment.tz(event.tst, TZ).format('YYYY-MM-DD')
  const departureDate = get(event, 'oday', journeyDate) || journeyDate

  return {
    id: `departure_journey_${id}`,
    journeyType:
      event.journey_type ||
      (typeof event.journey_start_time === 'undefined' ? 'deadrun' : 'journey'),
    type: event.event_type,
    routeId: event.route_id || '',
    direction: event.direction_id,
    originStopId,
    departureDate,
    departureTime: getJourneyStartTime(event),
    uniqueVehicleId: createValidVehicleId(event.unique_vehicle_id),
    mode: mode || null,
    events: Array.isArray(events) ? events : [event],
    alerts,
    cancellations: [],
    isCancelled: false,
    _numInstance: instanceIndex,
  }
}

export function createPlannedDepartureObject(
  departure: JoreRouteDepartureData | JoreDepartureWithOrigin,
  stop: Stop,
  departureDate: string,
  prefix = '',
  alerts: Alert[] = [],
  isOrigin: boolean = false
): Departure {
  const departureId = createDepartureId(departure, departureDate)
  const plannedDepartureTime = createPlannedDepartureTimeObject(departure, departureDate)

  return {
    id: prefix + '/' + departureId,
    stopId: get(departure, 'stop_id', get(stop, 'stopId', '')),
    dayType: departure.day_type,
    equipmentType: departure.equipment_type,
    equipmentIsRequired: !!departure.equipment_required,
    equipmentColor: departure.trunk_color_required ? 'HSL-orans' : '',
    operatorId: departure.operator_id,
    routeId: departure.route_id,
    direction: getDirection(departure.direction),
    terminalTime: departure.terminal_time,
    recoveryTime: departure.recovery_time,
    departureId: departure.departure_id,
    departureTime: plannedDepartureTime.departureTime,
    departureDate: plannedDepartureTime.departureDate,
    extraDeparture: departure.extra_departure,
    isNextDay: departure.is_next_day,
    isTimingStop: !!get(stop, 'isTimingStop', false) || false,
    index: get(stop, 'stopIndex', 0),
    mode: get(stop, 'modes[0]', Mode.Bus),
    stop,
    journey: null,
    alerts,
    cancellations: [],
    isCancelled: false,
    isOrigin: isOrigin || get(departure, 'origin_departure.stop_id', '') === departure.stop_id,
    originDepartureTime: departure.origin_departure
      ? createPlannedDepartureTimeObject(departure.origin_departure, departureDate)
      : null,
    plannedArrivalTime: createPlannedArrivalTimeObject(departure, departureDate),
    plannedDepartureTime,
  }
}
