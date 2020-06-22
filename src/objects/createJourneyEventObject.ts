import {
  AlertDistribution,
  Cancellation,
  Departure,
  DriverEvent,
  JourneyCancellationEvent,
  JourneyEvent,
  JourneyStopEvent,
  JourneyTlpEvent,
  TlpPriorityLevel,
  PlannedArrival,
  PlannedDeparture,
  PlannedStopEvent,
  Stop,
  VehiclePosition,
  TlpType,
} from '../types/generated/schema-types'
import { TIME_FORMAT, TZ } from '../constants'
import moment from 'moment-timezone'
import { getDateFromDateTime, getJourneyEventTime } from '../utils/time'
import { Vehicles, TlpEvents, EventType, TlpPriorityLevelDb } from '../types/EventsDb'
import { createJourneyId } from '../utils/createJourneyId'
import { get } from 'lodash'
import { createDepartureId } from './createDepartureObject'
import { isWithinRange } from 'date-fns'
import { diffDepartureJourney } from '../utils/diffDepartureJourney'
import { createValidVehicleId } from '../utils/createUniqueVehicleId'

export function createJourneyEventObject(event: Vehicles): JourneyEvent {
  const id = createJourneyId(event)
  const ts = moment.tz(event.tst, TZ)
  const unix = ts.unix()
  const receivedTs = moment.tz(event.received_at, TZ)

  const formattedMode = (event?.mode || 'BUS').toUpperCase()
  const mode = formattedMode === 'METRO' ? 'SUBWAY' : formattedMode

  return {
    id: `journey_event_${event.event_type || 'VP'}_${id}_${unix}`,
    type: event.event_type || 'VP',
    receivedAt: receivedTs.toISOString(true),
    recordedAt: ts.toISOString(true),
    recordedAtUnix: unix,
    recordedTime: getJourneyEventTime(event),
    stopId: (event.stop || '') + '' || null,
    lat: event.lat,
    lng: event.long,
    loc: event.loc,
    mode,
    _isVirtual: !!event._is_virtual,
    _sort: unix,
  }
}

export function createJourneyCancellationEventObject(
  cancellation: Cancellation
): JourneyCancellationEvent {
  const id = cancellation.id
  const ts = moment.tz(cancellation.lastModifiedDateTime, TZ)
  const unix = ts.unix()

  return {
    id: `journey_cancellation_event_${id}`,
    type: 'CANCELLATION',
    recordedAt: ts.toISOString(true),
    recordedAtUnix: unix,
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
    _sort: unix,
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

  const unix = moment.tz(departureDateTime, TZ).unix()
  const stopIndex = departure?.index || -1

  return {
    id: `journey_planned_stop_event_${id}`,
    type: 'PLANNED',
    stopId: departure.stopId + '',
    plannedDate: departureDate,
    plannedTime: departureTime,
    plannedDateTime: departureDateTime,
    plannedUnix: unix,
    isNextDay,
    departureId: departure.departureId,
    isTimingStop: departure.isTimingStop,
    isOrigin: departure.isOrigin || false,
    index: stopIndex,
    stop: departure.stop,
    _sort: unix,
  }
}

export function createJourneyStopEventObject(
  event: Vehicles,
  departure: Departure | null,
  stop: Stop | null,
  doorsOpened: boolean
): JourneyStopEvent {
  const id = createJourneyId(event)
  const ts = moment.tz(event.tst, TZ)
  const unix = ts.unix()
  const receivedTs = moment.tz(event.received_at, TZ).toISOString(true)

  const stopData = stop ? stop : departure ? departure?.stop : null

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

  const stopIndex = departure?.index || -1

  const formattedMode = (event?.mode || 'BUS').toUpperCase()
  const mode = formattedMode === 'METRO' ? 'SUBWAY' : formattedMode

  return {
    id: `journey_stop_event_${event.event_type}_${id}_${unix}`,
    type: event.event_type,
    receivedAt: receivedTs,
    recordedAt: ts.toISOString(true),
    recordedAtUnix: unix,
    recordedTime: getJourneyEventTime(event),
    stopId: (stopData?.stopId || event.stop) + '',
    nextStopId: (event.next_stop_id || '') + '',
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
    index: stopIndex,
    stop: stopData,
    unplannedStop: !departure,
    lat: event.lat,
    lng: event.long,
    loc: event.loc,
    mode,
    _isVirtual: !!event._is_virtual,
    _sort: unix,
  }
}

const mapTlpPriorityLevel = (
  tlpPriorityLevel: TlpPriorityLevelDb | null
): TlpPriorityLevel | null => {
  return tlpPriorityLevel === TlpPriorityLevelDb.Normal
    ? TlpPriorityLevel.Normal
    : tlpPriorityLevel === TlpPriorityLevelDb.High
    ? TlpPriorityLevel.High
    : tlpPriorityLevel === TlpPriorityLevelDb.Norequest
    ? TlpPriorityLevel.Norequest
    : null
}

export function createJourneyTlpEventObject(event: TlpEvents): JourneyTlpEvent {
  const id = createJourneyId(event)
  const ts = moment.tz(event.tst, TZ)
  const unix = ts.unix()
  const receivedTs = moment.tz(event.received_at, TZ)

  const formattedMode = (event?.mode || 'BUS').toUpperCase()
  const mode = formattedMode === 'METRO' ? 'SUBWAY' : formattedMode

  return {
    id: `journey_tlp_event_${event.event_type}_${id}_${unix}`,
    type: event.event_type,
    requestId: get(event, 'tlp_requestid', null),
    requestType: get(event, 'tlp_requesttype', null),
    priorityLevel: mapTlpPriorityLevel(event.tlp_prioritylevel),
    reason: get(event, 'tlp_reason', null),
    attemptSeq: get(event, 'tlp_att_seq', null),
    decision: get(event, 'tlp_decision', null),
    junctionId: get(event, 'sid', null),
    signalGroupId: get(event, 'signal_groupid', null),
    signalGroupNbr: get(event, 'tlp_signalgroupnbr', null),
    lineConfigId: get(event, 'tlp_line_configid', null),
    pointConfigId: get(event, 'tlp_point_configid', null),
    frequency: get(event, 'tlp_frequency', null),
    protocol: get(event, 'tlp_protocol', null),
    receivedAt: receivedTs.toISOString(true),
    recordedAt: ts.toISOString(true),
    recordedAtUnix: unix,
    recordedTime: getJourneyEventTime(event),
    lat: event.lat,
    lng: event.long,
    loc: event.loc,
    mode,
    // Sort TLA events after TLR events
    _sort: unix,
  }
}

export function createVehiclePositionObject(event: Vehicles, id?: string): VehiclePosition {
  const useId = id || createJourneyId(event)
  const ts = moment.tz(event.tst, TZ)
  const unix = ts.unix()
  const receivedTs = moment.tz(event.received_at, TZ)

  const journeyType = !event.journey_type
    ? typeof event.journey_start_time === 'undefined'
      ? 'deadrun'
      : 'journey'
    : event.journey_type

  const formattedMode = (event?.mode || 'BUS').toUpperCase()
  const mode = formattedMode === 'METRO' ? 'SUBWAY' : formattedMode

  return {
    id: `vehicle_position_event_${useId}_${unix}_${event.lat}_${event.long}`,
    journeyType,
    receivedAt: receivedTs.toISOString(true),
    recordedAt: ts.toISOString(true),
    recordedAtUnix: unix,
    recordedTime: getJourneyEventTime(event),
    stop: (event.stop || '') + '',
    nextStopId: (event.next_stop_id || '') + '',
    lat: event.lat,
    lng: event.long,
    loc: event.loc,
    doorStatus: event.drst,
    velocity: event.spd,
    delay: event.dl || 0,
    heading: event.hdg,
    mode,
    _sort: unix,
  }
}

export function createUnsignedVehiclePositionObject(event: Vehicles): VehiclePosition {
  const ts = moment.tz(event.tst, TZ)
  const unix = ts.unix()
  const receivedTs = moment.tz(event.received_at, TZ)

  const formattedMode = (event?.mode || 'BUS').toUpperCase()
  const mode = formattedMode === 'METRO' ? 'SUBWAY' : formattedMode

  return {
    id: `unsigned_position_${event.unique_vehicle_id}_${unix}_${event.lat}_${event.long}`,
    journeyType: event.journey_type || 'deadrun',
    receivedAt: receivedTs.toISOString(true),
    recordedAt: ts.toISOString(true),
    recordedAtUnix: unix,
    recordedTime: getJourneyEventTime(event),
    uniqueVehicleId: createValidVehicleId(event.unique_vehicle_id),
    lat: event.lat,
    lng: event.long,
    doorStatus: event.drst,
    velocity: event.spd,
    delay: event.dl || 0,
    heading: event.hdg,
    mode,
  }
}

export function createDriverEventObject(event: Vehicles): DriverEvent {
  const ts = moment.tz(event.tst, TZ)
  const unix = ts.unix()
  const receivedTs = moment.tz(event.received_at, TZ)

  const formattedMode = (event?.mode || 'BUS').toUpperCase()
  const mode = formattedMode === 'METRO' ? 'SUBWAY' : formattedMode

  return {
    id: `driver_event_${event.event_type}_${event.unique_vehicle_id}_${unix}`,
    journeyType: event.journey_type || 'deadrun',
    eventType: event.event_type,
    receivedAt: receivedTs.toISOString(true),
    recordedAt: ts.toISOString(true),
    recordedAtUnix: unix,
    recordedTime: getJourneyEventTime(event),
    uniqueVehicleId: createValidVehicleId(event.unique_vehicle_id),
    operatorId: event.owner_operator_id + '',
    vehicleId: event.vehicle_number + '',
    lat: event.lat,
    lng: event.long,
    loc: event.loc,
    mode,
  }
}
