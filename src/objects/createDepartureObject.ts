import {
  JoreDeparture,
  JoreDepartureWithOrigin,
  JoreOriginDeparture,
  JoreRouteDepartureData,
  Mode,
} from '../types/Jore'
import {
  Alert,
  Departure,
  DepartureJourney,
  PlannedArrival,
  PlannedDeparture,
  Stop,
} from '../types/generated/schema-types'
import { getDateFromDateTime, getDepartureTime, getJourneyStartTime } from '../utils/time'
import { createJourneyId } from '../utils/createJourneyId'
import { createValidVehicleId } from '../utils/createUniqueVehicleId'
import { get } from 'lodash'
import { getDirection } from '../utils/getDirection'
import { doubleDigit } from '../utils/doubleDigit'
import { Vehicles } from '../types/EventsDb'
import { TZ } from '../constants'
import moment from 'moment-timezone'
import { extraDepartureType } from '../utils/extraDepartureType'
import { dayTypes, getDayTypeFromDate } from '../utils/dayTypes'

function createJoreDepartureId(departure: JoreDeparture, date) {
  return `${departure.route_id}_${departure.direction}_${doubleDigit(
    departure.hours
  )}_${doubleDigit(departure.minutes)}_${departure.stop_id}_${
    departure.day_type
  }_${extraDepartureType(departure.extra_departure)}_${date}_${departure.date_begin}_${
    departure.date_end
  }`
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
  const arrivalTime = getDepartureTime(departure, 'arrival')
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
  const departureId = createDepartureId(departure, date)
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
  event: Vehicles | null,
  originStopId: string,
  instanceIndex: number = 0,
  mode = Mode.Bus,
  alerts: Alert[] = []
): DepartureJourney | null {
  if (!event) {
    return null
  }

  const id = createJourneyId(event)
  const journeyDate = moment.tz(event?.tst, TZ).format('YYYY-MM-DD')
  const eventOday = get(event, 'oday', journeyDate) || journeyDate

  return {
    id: `departure_journey_${id}_${event?.event_type}`,
    journeyType:
      event?.journey_type ||
      (typeof event?.journey_start_time === 'undefined' ? 'deadrun' : 'journey'),
    type: event?.event_type || 'PDE',
    routeId: event?.route_id || '',
    direction: event?.direction_id,
    originStopId,
    departureDate: eventOday,
    departureTime: getJourneyStartTime(event),
    uniqueVehicleId: createValidVehicleId(event?.unique_vehicle_id),
    mode: mode || null,
    alerts,
    cancellations: [],
    isCancelled: false,
    _numInstance: instanceIndex,
  }
}

export function createPlannedDepartureObject(
  departure: JoreRouteDepartureData | JoreDepartureWithOrigin,
  departureDate: string,
  prefix = '',
  alerts: Alert[] = [],
  isOrigin: boolean = false
): Departure {
  const departureId = createDepartureId(departure, departureDate)

  const plannedArrivalTime = createPlannedArrivalTimeObject(departure, departureDate)
  const plannedDepartureTime = createPlannedDepartureTimeObject(departure, departureDate)
  const normalDepartureDayType = dayTypes.includes(departure.day_type)
    ? departure.day_type
    : getDayTypeFromDate(departureDate)

  return {
    id: prefix + '/' + departureId,
    stopId: get(departure, 'stop_id', '') + '',
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
    trainNumber: departure.train_number,
    departureTime: plannedDepartureTime.departureTime,
    departureDate: plannedDepartureTime.departureDate,
    extraDeparture: extraDepartureType(departure.extra_departure),
    isNextDay: departure.is_next_day,
    isTimingStop: !!get(departure, 'isTimingStop', false) || false,
    journey: null,
    alerts,
    operatingUnit: departure?.procurement_unit_id || '',
    cancellations: [],
    isCancelled: false,
    isOrigin: isOrigin || get(departure, 'origin_departure.stop_id', '') === departure.stop_id,
    originDepartureTime: departure.origin_departure
      ? createPlannedDepartureTimeObject(departure.origin_departure, departureDate)
      : null,
    plannedArrivalTime,
    plannedDepartureTime,
    _normalDayType: normalDepartureDayType, // If there are dayType exceptions, set the normal dayType of the date here.
  }
}
