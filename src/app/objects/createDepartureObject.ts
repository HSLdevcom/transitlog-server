import { JoreDeparture } from '../../types/Jore'
import {
  DepartureJourney,
  PlannedArrival,
  PlannedDeparture,
  RouteSegment,
} from '../../types/generated/schema-types'
import { getDateFromDateTime, getDepartureTime, getJourneyStartTime } from '../../utils/time'
import moment from 'moment-timezone'
import { PlannedDeparture as PlannedDepartureObject } from '../../types/PlannedDeparture'
import { TZ } from '../../constants'
import { get } from 'lodash'
import { Vehicles } from '../../types/generated/hfp-types'
import { createJourneyId } from '../../utils/createJourneyId'
import { createValidVehicleId } from '../../utils/createUniqueVehicleId'

export function createDepartureId(departure) {
  return `${departure.route_id}_${departure.direction}_${departure.hours}_${departure.minutes}_${
    departure.stop_id
  }_${departure.day_type}_${departure.extra_departure}`
}

export function createPlannedArrivalTimeObject(departure: JoreDeparture, date): PlannedArrival {
  const arrivalTime = getDepartureTime(departure, true)
  const departureId = createDepartureId(departure)

  return {
    id: `pat_${departureId}_${arrivalTime}`, // pat = Planned Arrival Time
    arrivalDate: date,
    arrivalTime,
    arrivalDateTime: moment.tz(getDateFromDateTime(date, arrivalTime), TZ).toISOString(true),
    isNextDay: departure.arrival_is_next_day,
  }
}

export function createPlannedDepartureTimeObject(
  departure: JoreDeparture,
  date: string
): PlannedDeparture {
  const departureTime = getDepartureTime(departure)
  const departureId = createDepartureId(departure)
  const departureDateTime = getDateFromDateTime(date, departureTime).toISOString(true)

  return {
    id: `pdt_${departureId}_${departureTime}`, // pdt = Planned Departure Time
    departureDate: date,
    departureTime,
    departureDateTime,
    isNextDay: departure.is_next_day,
  }
}

export function createDepartureJourneyObject(
  event: Vehicles,
  departureIsNextDay: boolean,
  originStopId: string,
  instanceIndex: number = 0
): DepartureJourney {
  const id = createJourneyId(event)

  return {
    id: `departure_journey_${id}`,
    routeId: event.route_id || '',
    direction: event.direction_id,
    originStopId,
    departureDate: event.oday,
    departureTime: getJourneyStartTime(event, departureIsNextDay),
    uniqueVehicleId: createValidVehicleId(event.unique_vehicle_id),
    _numInstance: instanceIndex,
  }
}

export function createPlannedDepartureObject(
  departure: JoreDeparture,
  stop: RouteSegment | null,
  departureDate: string
): PlannedDepartureObject {
  const departureId = createDepartureId(departure)

  return {
    id: departureId,
    stopId: departure.stop_id,
    dayType: departure.day_type,
    equipmentType: departure.equipment_type,
    equipmentIsRequired: !!departure.equipment_required,
    equipmentColor: departure.trunk_color_required ? 'HSL-orans' : '',
    operatorId: departure.operator_id,
    routeId: departure.route_id,
    direction: departure.direction,
    terminalTime: departure.terminal_time,
    recoveryTime: departure.recovery_time,
    departureId: departure.departure_id,
    extraDeparture: departure.extra_departure,
    isNextDay: departure.is_next_day,
    isTimingStop: get(stop, 'isTimingStop', false),
    index: get(stop, 'stopIndex', 0),
    stop,
    journey: null,
    originDepartureTime: departure.origin_departure
      ? createPlannedDepartureTimeObject(departure.origin_departure, departureDate)
      : null,
    plannedArrivalTime: createPlannedArrivalTimeObject(departure, departureDate),
    plannedDepartureTime: createPlannedDepartureTimeObject(departure, departureDate),
  }
}
