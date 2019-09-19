import {
  Departure,
  JourneyEvent,
  JourneyStopEvent,
  RouteSegment,
  Stop,
  VehiclePosition,
} from '../../types/generated/schema-types'
import { TZ } from '../../constants'
import moment from 'moment-timezone'
import { getJourneyEventTime } from '../../utils/time'
import { Vehicles } from '../../types/EventsDb'
import { createJourneyId } from '../../utils/createJourneyId'
import { get } from 'lodash'

export function createJourneyEventObject(event: Vehicles): JourneyEvent {
  const id = createJourneyId(event)

  const unix = parseInt(event.tsi, 10)
  const ts = moment.tz(event.tst, TZ).toISOString(true)

  return {
    id: `journey_event_${id}_${unix}`,
    type: event.event_type || 'VP',
    recordedAt: ts,
    recordedAtUnix: unix,
    recordedTime: getJourneyEventTime(event),
  }
}

export function createJourneyStopEventObject(
  event: Vehicles,
  departure: Departure | null,
  stop: Stop | null
): JourneyStopEvent {
  const id = createJourneyId(event)
  const unix = parseInt(event.tsi, 10)
  const ts = moment.tz(event.tst, TZ).toISOString(true)
  const stopData = stop ? stop : departure ? departure.stop : null

  return {
    id: `journey_stop_event_${event.event_type}_${id}_${unix}`,
    type: event.event_type,
    recordedAt: ts,
    recordedAtUnix: unix,
    recordedTime: getJourneyEventTime(event),
    stopId: event.stop || '',
    nextStopId: event.next_stop_id || '',
    doorsOpened: true,
    stopped: false,
    plannedDate: get(departure, 'plannedDepartureTime.departureDate', null),
    plannedTime: get(departure, 'plannedDepartureTime.departureTime', null),
    plannedDateTime: get(departure, 'plannedDepartureTime.departureDateTime', null),
    plannedTimeDifference: 0,
    isNextDay: get(departure, 'isNextDay', null),
    departureId: get(departure, 'departureId', null),
    isTimingStop: get(departure, 'isTimingStop', get(stop, 'isTimingStop', false)),
    index: get(departure, 'index', null),
    stop: stopData,
  }
}

export function createVehiclePositionObject(event: Vehicles, id?: string): VehiclePosition {
  const useId = id || createJourneyId(event)
  const unix = parseInt(event.tsi, 10)
  const ts = moment.tz(event.tst, TZ).toISOString(true)

  return {
    id: `vehicle_position_event_${useId}_${unix}`,
    recordedAt: ts,
    recordedAtUnix: unix,
    recordedTime: getJourneyEventTime(event),
    nextStopId: event.next_stop_id,
    lat: event.lat,
    lng: event.long,
    doorStatus: event.drst,
    velocity: event.spd,
    delay: event.dl,
    heading: event.hdg,
  }
}
