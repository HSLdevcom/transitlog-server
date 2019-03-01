import { Departure as JoreDeparture } from '../../types/generated/jore-types'
import { PlannedArrival, PlannedDeparture } from '../../types/generated/schema-types'
import { StopSegmentCombo } from '../../types/StopSegmentCombo'
import { getDateFromDateTime, getDepartureTime } from '../../utils/time'
import moment from 'moment-timezone'
import { PlannedDeparture as PlannedDepartureObject } from '../../types/PlannedDeparture'

export function createDepartureId(departure) {
  return `${departure.routeId}_${departure.direction}_${departure.hours}_${
    departure.minutes
  }_${departure.stopId}_${departure.dayType}_${departure.extraDeparture}`
}

export function createPlannedArrivalTimeObject(
  departure: JoreDeparture,
  date
): PlannedArrival {
  const arrivalTime = getDepartureTime(departure, true)

  return {
    arrivalDate: date,
    arrivalTime,
    arrivalDateTime: moment.tz(getDateFromDateTime(date, arrivalTime)).toISOString(true),
  }
}

export function createPlannedDepartureTimeObject(
  departure: JoreDeparture,
  date
): PlannedDeparture {
  const departureTime = getDepartureTime(departure)

  return {
    departureDate: date,
    departureTime,
    departureDateTime: moment
      .tz(getDateFromDateTime(date, departureTime))
      .toISOString(true),
  }
}

export function createPlannedDepartureObject(
  departure: JoreDeparture,
  stop: StopSegmentCombo,
  departureDate: string
): PlannedDepartureObject {
  return {
    id: createDepartureId(departure),
    stopId: stop.stopId,
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
    isTimingStop: stop.isTimingStop,
    index: stop.stopIndex,
    stop,
    plannedArrivalTime: createPlannedArrivalTimeObject(departure, departureDate),
    plannedDepartureTime: createPlannedDepartureTimeObject(departure, departureDate),
  }
}
