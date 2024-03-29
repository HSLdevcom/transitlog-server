import { doubleDigit } from './doubleDigit'
import moment from 'moment-timezone'
import { get } from 'lodash'
import {
  Departure,
  JourneyEvent,
  JourneyStopEvent,
  VehiclePosition,
} from '../types/generated/schema-types'
import { Journey as JourneyType } from '../types/Journey'
import { TZ } from '../constants'
import { Moment } from 'moment'
import { Vehicles } from '../types/EventsDb'

const num = (val) => parseInt(val, 10)

export function timeToSeconds(timeStr = ''): number {
  const [hours = 0, minutes = 0, seconds = 0] = (timeStr || '').split(':')
  return num(seconds) + num(minutes) * 60 + num(hours) * 60 * 60
}

type TimeObject = {
  hours: number
  minutes: number
  seconds: number
}

export function secondsToTimeObject(seconds: number): TimeObject {
  const absSeconds = Math.abs(seconds)

  const totalSeconds = Math.floor(absSeconds % 60)
  const minutes = Math.floor((absSeconds % 3600) / 60)
  const hours = Math.floor(absSeconds / 60 / 60)

  return {
    hours,
    minutes,
    seconds: totalSeconds,
  }
}

export function secondsToTime(secondsDuration: number): string {
  const { hours = 0, minutes = 0, seconds = 0 } = secondsToTimeObject(secondsDuration)
  return getTimeString(hours, minutes, seconds)
}

export function getNormalTime(time?: string): string {
  const [hours = '0', minutes = '0', seconds = '0'] = (time || '').split(':')
  let intHours = parseInt(hours, 10)

  if (intHours > 23) {
    intHours = intHours - 24
  }

  return getTimeString(intHours, num(minutes), num(seconds))
}

export function isNextDay(time?: string): boolean {
  const [hours = '0'] = (time || '').split(':')

  if (parseInt(hours, 10) > 23) {
    return true
  }

  return false
}

export function getTimeString(hours = 0, minutes = 0, seconds = 0): string {
  return `${doubleDigit(hours)}:${doubleDigit(minutes)}:${doubleDigit(seconds)}`
}

export function getDateFromDateTime(date: string, time: string = '00:00:00'): Moment {
  // Get the seconds elapsed during the date. The time can be a 24h+ time.
  const seconds = timeToSeconds(time)
  const baseDate = moment.tz(date, TZ)
  // Add the seconds. This is how we can use Moment to represent 24h+ times.
  const nextDate = baseDate.clone().add(seconds, 'seconds')

  // In Finland DST changes at 3am in the morning, so the baseDate will not be in DST but when we
  // add the seconds, moment notices that it needs to add an hour and does so. This is actually
  // not desired as then the time will be wrong as we are adding seconds. Adjust the moments back
  // if their DST states differ.
  if (nextDate.isDST() && !baseDate.isDST()) {
    nextDate.subtract(1, 'hour')
  } else if (!nextDate.isDST() && baseDate.isDST()) {
    nextDate.add(1, 'hour')
  }

  return nextDate
}

// Get the (potentially) 24h+ time of the journey.
export function getJourneyStartTime(
  event: JourneyType | null,
  // Timing event can provide a better timestamp to compare the planned time
  // against if the main event happened at an irregular time.
  timingEvent: JourneyEvent | JourneyStopEvent | VehiclePosition | null = null
): string {
  const journeyStartTime = get(
    event,
    'journey_start_time',
    get(event, 'departureTime', get(event, 'plannedTime', false))
  )

  const recordedAtTimestamp = timingEvent
    ? timingEvent?.recordedAt
    : get(event, 'tst', get(event, 'events[0].recordedAt', 0))

  const eventDate = moment.tz(recordedAtTimestamp, TZ)

  if (!journeyStartTime) {
    return ''
  }

  const operationDay = get(
    event,
    'oday',
    get(event, 'departureDate', get(event, 'plannedDate', false))
  )

  const odayDate = getDateFromDateTime(operationDay)
  const diff = eventDate.diff(odayDate, 'seconds')

  const [hours, minutes, seconds] = journeyStartTime.split(':')
  let intHours = parseInt(hours, 10)

  /*
    If the journey time was more than a day after the operation day, we're probably
    dealing with a 24h+ journey. Also make sure that the start time hours are under 21,
    which was chosen as a time that shouldn't appear more than once in a 24h+ day.
    Thus, the maximum day length supported is 36h. After that things get weird.

    There must be an upper limit to intHours, otherwise times such as 23:59 get 24 hours
    added to them if the event happens after midnight. Not good.

    The diff check should be under 24 to also allow event times that are before the
    planned start times for journeys that teeter on the edge of midnight.
   */

  if (intHours <= 19 && Math.floor(diff / 60 / 60) >= 23) {
    intHours = intHours + Math.max(1, Math.min(24, Math.floor(diff / 60 / 60)))
  }

  return getTimeString(intHours, minutes, seconds)
}

export function getJourneyEventTime(event: Vehicles) {
  const timestampMoment = moment.tz(event.tst, TZ)

  if (!event.journey_start_time) {
    return timestampMoment.format('HH:mm:ss')
  }

  let hours = timestampMoment.hours()
  const minutes = timestampMoment.minutes()
  const seconds = timestampMoment.seconds()

  if (event.oday !== timestampMoment.format('YYYY-MM-DD')) {
    hours = hours + 24
  }

  return getTimeString(hours, minutes, seconds)
}

interface JoreDepartureTime {
  is_next_day: boolean
  hours: number
  minutes: number
  arrival_hours?: number
  arrival_minutes?: number
}

// Custom type guard
function isJoreDeparture(departure): departure is JoreDepartureTime {
  return (departure as JoreDepartureTime).hours !== undefined
}

// Return the departure time as a 24h+ time string
export function getDepartureTime(departure: JoreDepartureTime, useArrival = false): string {
  let { is_next_day, hours, minutes } = departure

  if (useArrival && departure.arrival_hours && departure.arrival_minutes) {
    hours = departure.arrival_hours
    minutes = departure.arrival_minutes
  }

  const hour = is_next_day && hours < 24 ? hours + 24 : hours
  return getTimeString(hour, minutes)
}

// Return the real time of the departure as a Date
export function getRealDepartureDate(
  departure: JoreDepartureTime | Departure,
  date,
  useArrival
): Moment {
  let time = ''

  if (departure && !isJoreDeparture(departure)) {
    if (
      useArrival &&
      typeof departure.plannedArrivalTime !== 'undefined' &&
      departure.plannedArrivalTime !== null
    ) {
      time = departure.plannedArrivalTime.arrivalTime
    } else if (
      !useArrival &&
      typeof departure.plannedDepartureTime !== 'undefined' &&
      departure.plannedDepartureTime !== null
    ) {
      time = departure.plannedDepartureTime.departureTime
    }
  } else if (isJoreDeparture(departure)) {
    time = getDepartureTime(departure, useArrival)
  }

  return getDateFromDateTime(date, time)
}
