import { Departure as JoreDeparture } from '../../types/generated/jore-types'
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

export function createDepartureId(departure, instance = 0) {
  return `${departure.routeId}_${departure.direction}_${departure.hours}_${departure.minutes}_${
    departure.stopId
  }_${departure.dayType}_${departure.extraDeparture}_${instance}`
}

export function createPlannedArrivalTimeObject(departure: JoreDeparture, date): PlannedArrival {
  const arrivalTime = getDepartureTime(departure, true)

  return {
    arrivalDate: date,
    arrivalTime,
    arrivalDateTime: moment.tz(getDateFromDateTime(date, arrivalTime), TZ).toISOString(true),
    isNextDay: departure.isNextDay,
  }
}

export function createPlannedDepartureTimeObject(departure: JoreDeparture, date): PlannedDeparture {
  const departureTime = getDepartureTime(departure)

  return {
    departureDate: date,
    departureTime,
    departureDateTime: moment.tz(getDateFromDateTime(date, departureTime), TZ).toISOString(true),
    isNextDay: departure.isNextDay,
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
    id,
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
    stopId: departure.stopId,
    dayType: departure.dayType,
    equipmentType: departure.equipmentType,
    equipmentIsRequired: !!departure.equipmentRequired,
    equipmentColor: departure.trunkColorRequired ? 'HSL-orans' : '',
    operatorId: departure.operatorId,
    routeId: departure.routeId,
    direction: departure.direction,
    terminalTime: departure.terminalTime,
    recoveryTime: departure.recoveryTime,
    departureId: departure.departureId,
    extraDeparture: departure.extraDeparture,
    isNextDay: departure.isNextDay,
    isTimingStop: get(stop, 'isTimingStop', false),
    index: get(stop, 'stopIndex', 0),
    stop,
    journey: null,
    originDepartureTime: departure.originDeparture
      ? createPlannedDepartureTimeObject(departure.originDeparture, departureDate)
      : null,
    plannedArrivalTime: createPlannedArrivalTimeObject(departure, departureDate),
    plannedDepartureTime: createPlannedDepartureTimeObject(departure, departureDate),
  }
}
