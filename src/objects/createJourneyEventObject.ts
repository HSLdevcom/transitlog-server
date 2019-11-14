import {
  AlertDistribution,
  Cancellation,
  Departure,
  JourneyCancellationEvent,
  JourneyEvent,
  JourneyStopEvent,
  PlannedArrival,
  PlannedDeparture,
  PlannedStopEvent,
  Stop,
  VehiclePosition,
} from '../types/generated/schema-types'
import { TIME_FORMAT, TZ } from '../constants'
import moment from 'moment-timezone'
import { getDateFromDateTime, getJourneyEventTime } from '../utils/time'
import { Vehicles } from '../types/EventsDb'
import { createJourneyId } from '../utils/createJourneyId'
import { get } from 'lodash'
import { createDepartureId } from './createDepartureObject'
import { isWithinRange } from 'date-fns'
import { diffDepartureJourney } from '../utils/diffDepartureJourney'
import { createValidVehicleId } from '../utils/createUniqueVehicleId'

export function createJourneyEventObject(event: Vehicles): JourneyEvent {
  const id = createJourneyId(event)

  const unix = parseInt(event.tsi, 10)
  const ts = moment.tz(event.tst, TZ)

  return {
    id: `journey_event_${event.event_type || 'VP'}_${id}_${unix}`,
    type: event.event_type || 'VP',
    recordedAt: ts.toISOString(true),
    recordedAtUnix: ts.unix(),
    recordedTime: getJourneyEventTime(event),
    stopId: (event.stop || '') + '' || null,
    lat: event.lat,
    lng: event.long,
    _isVirtual: !!event._is_virtual,
  }
}

export function createJourneyCancellationEventObject(
  cancellation: Cancellation
): JourneyCancellationEvent {
  const id = cancellation.id
  const ts = moment.tz(cancellation.lastModifiedDateTime, TZ)

  return {
    id: `journey_cancellation_event_${id}`,
    type: 'CANCELLATION',
    recordedAt: ts.toISOString(true),
    recordedAtUnix: ts.unix(),
    recordedTime: ts.format(TIME_FORMAT),
    plannedDate: cancellation.departureDate,
    plannedTime: cancellation.journeyStartTime,
    title: cancellation.title,
    description: cancellation.description,
    category: cancellation.category,
    subCategory: cancellation.subCategory,
    isCancelled: cancellation.isCancelled,
    cancellationType: cancellation.cancellationType,
    cancellationEffect: cancellation.cancellationEffect,
  }
}

export function createPlannedStopEventObject(departure: Departure, alerts): PlannedStopEvent {
  const id = createDepartureId(departure)
  const {
    departureDate,
    departureTime,
    departureDateTime,
    isNextDay,
  } = departure.plannedDepartureTime

  departure.stop.alerts = alerts.filter((alert) => {
    if (!isWithinRange(departureDateTime, alert.startDateTime, alert.endDateTime)) {
      return false
    }

    return (
      alert.distribution === AlertDistribution.AllStops ||
      alert.affectedId === departure.stopId
    )
  })

  return {
    id: `journey_planned_stop_event_${id}`,
    type: 'PLANNED',
    stopId: departure.stopId + '',
    plannedDate: departureDate,
    plannedTime: departureTime,
    plannedDateTime: departureDateTime,
    plannedUnix: moment.tz(departureDateTime, TZ).unix(),
    isNextDay,
    departureId: departure.departureId,
    isTimingStop: departure.isTimingStop,
    isOrigin: departure.isOrigin || false,
    index: departure.index,
    stop: departure.stop,
  }
}

export function createJourneyStopEventObject(
  event: Vehicles,
  departure: Departure | null,
  stop: Stop | null,
  doorsOpened: boolean,
  stopped: boolean
): JourneyStopEvent {
  const id = createJourneyId(event)
  const unix = parseInt(event.tsi, 10)
  const ts = moment.tz(event.tst, TZ).toISOString(true)
  const stopData = stop ? stop : departure ? departure.stop : null

  const isArrival = ['ARR', 'ARS'].includes(event.event_type)

  let plannedDate = event.oday
  let plannedTime = null
  let plannedDateTime = null

  if (isArrival) {
    const plannedTimes: PlannedArrival | null = get(departure, 'plannedArrivalTime', null)

    plannedDate = get(plannedTimes, 'arrivalDate', event.oday)
    plannedTime = get(plannedTimes, 'arrivalTime', null)
    plannedDateTime = get(plannedTimes, 'arrivalDateTime', null)
  } else {
    const plannedTimes: PlannedDeparture | null = get(departure, 'plannedDepartureTime', null)

    plannedDate = get(plannedTimes, 'departureDate', event.oday)
    plannedTime = get(plannedTimes, 'departureTime', null)
    plannedDateTime = get(plannedTimes, 'departureDateTime', null)
  }

  const plannedTimeDiff = !departure
    ? 0
    : diffDepartureJourney(event, departure, departure.departureDate, isArrival)

  const eventPlannedMoment = getDateFromDateTime(event.oday, event.journey_start_time || '')
  const departurePlannedMoment = moment.tz(plannedDateTime, TZ)

  const plannedUnix =
    plannedDateTime && departurePlannedMoment.isValid()
      ? departurePlannedMoment.unix()
      : eventPlannedMoment.unix()

  return {
    id: `journey_stop_event_${event.event_type}_${id}_${unix}`,
    type: event.event_type,
    recordedAt: ts,
    recordedAtUnix: unix,
    recordedTime: getJourneyEventTime(event),
    stopId: get(stopData, 'stopId', get(event, 'stopId')) + '',
    nextStopId: (event.next_stop_id || '') + '',
    stopped,
    doorsOpened,
    plannedDate,
    plannedTime,
    plannedDateTime,
    plannedUnix,
    plannedTimeDifference: plannedTimeDiff,
    isNextDay: get(
      departure,
      'isNextDay',
      event.oday !== eventPlannedMoment.format('YYYY-MM-DD')
    ),
    departureId: get(departure, 'departureId', null),
    isTimingStop: get(departure, 'isTimingStop', get(stop, 'isTimingStop', false)),
    isOrigin: get(departure, 'isOrigin', false),
    index: get(departure, 'index', -1),
    stop: stopData,
    unplannedStop: !departure,
    lat: event.lat,
    lng: event.long,
    _isVirtual: !!event._is_virtual,
  }
}

export function createVehiclePositionObject(event: Vehicles, id?: string): VehiclePosition {
  const useId = id || createJourneyId(event)
  const unix = parseInt(event.tsi, 10)
  const ts = moment.tz(event.tst, TZ).toISOString(true)

  const journeyType = !event.journey_type
    ? typeof event.journey_start_time === 'undefined'
      ? 'deadrun'
      : 'journey'
    : event.journey_type

  return {
    id: `vehicle_position_event_${useId}_${unix}_${event.lat}_${event.long}`,
    journeyType,
    recordedAt: ts,
    recordedAtUnix: unix,
    recordedTime: getJourneyEventTime(event),
    stop: (event.stop || '') + '',
    nextStopId: (event.next_stop_id || '') + '',
    lat: event.lat,
    lng: event.long,
    doorStatus: event.drst,
    velocity: event.spd,
    delay: event.dl || 0,
    heading: event.hdg,
    mode: event.mode,
  }
}

export function createUnsignedVehiclePositionObject(event: Vehicles): VehiclePosition {
  const unix = parseInt(event.tsi, 10)
  const ts = moment.tz(event.tst, TZ).toISOString(true)

  return {
    id: `unsigned_position_${event.unique_vehicle_id}_${unix}_${event.lat}_${event.long}`,
    journeyType: event.journey_type || 'deadrun',
    recordedAt: ts,
    recordedAtUnix: unix,
    recordedTime: getJourneyEventTime(event),
    uniqueVehicleId: createValidVehicleId(event.unique_vehicle_id),
    lat: event.lat,
    lng: event.long,
    doorStatus: event.drst,
    velocity: event.spd,
    delay: event.dl || 0,
    heading: event.hdg,
    mode: event.mode,
  }
}
