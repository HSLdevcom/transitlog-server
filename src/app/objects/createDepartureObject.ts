import { Departure as JoreDeparture } from '../../types/generated/jore-types'
import {
  Date,
  DepartureJourney,
  DepartureStop,
  Direction,
  Maybe,
  PlannedArrival,
  PlannedDeparture,
  Time,
  VehicleId,
} from '../../types/generated/schema-types'
import { StopSegmentCombo } from '../../types/StopSegmentCombo'
import { getDateFromDateTime, getDepartureTime, getJourneyStartTime } from '../../utils/time'
import moment from 'moment-timezone'
import { PlannedDeparture as PlannedDepartureObject } from '../../types/PlannedDeparture'
import { TZ } from '../../constants'
import { get } from 'lodash'
import { Vehicles } from '../../types/generated/hfp-types'
import { createJourneyId } from '../../utils/createJourneyId'

export function createDepartureId(departure) {
  return `${departure.routeId}_${departure.direction}_${departure.hours}_${departure.minutes}_${
    departure.stopId
  }_${departure.dayType}_${departure.extraDeparture}`
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
  routeData: { originStopId: string; lineId: string } = { originStopId: '', lineId: '' },
  instance = 0
): DepartureJourney {
  return {
    id: createJourneyId(event),
    lineId: routeData.lineId,
    routeId: event.route_id || '',
    direction: event.direction_id,
    originStopId: routeData.originStopId,
    departureDate: event.oday,
    departureTime: getJourneyStartTime(event, departureIsNextDay),
    uniqueVehicleId: event,
    instance,
  }
}

export function createPlannedDepartureObject(
  departure: JoreDeparture,
  stop: StopSegmentCombo | DepartureStop | null,
  departureDate: string
): PlannedDepartureObject {
  return {
    id: createDepartureId(departure),
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
