import { doubleDigit } from './doubleDigit'
import startOfDay from 'date-fns/start_of_day'
import addSeconds from 'date-fns/add_seconds'
import diffHours from 'date-fns/difference_in_hours'
import parse from 'date-fns/parse'
import format from 'date-fns/format'
import { Vehicles } from '../types/generated/hfp-types'
import { get } from 'lodash'
import { Journey } from '../types/generated/schema-types'

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

export function getTimeString(hours = 0, minutes = 0, seconds = 0): string {
  return `${doubleDigit(hours)}:${doubleDigit(minutes)}:${doubleDigit(seconds)}`
}

export function getDateFromDateTime(date: string, time: string = '00:00:00'): Date {
  // Get the seconds elapsed during the date. The time can be a 24h+ time.
  const seconds = timeToSeconds(time)
  // Create a moment from the date and add the seconds.
  return addSeconds(startOfDay(date), seconds)
}

// Get the (potentially) 24h+ time of the journey.
// For best results, pass in the observed start time as useDate, but if that's
// not available, use the time of the first event from this journey that you have.
export function getJourneyStartTime(event: Vehicles | Journey, useDate?: Date): string {
  const operationDay = get(event, 'oday', get(event, 'departureDate', false))
  const journeyStartTime = get(
    event,
    'journey_start_time',
    get(event, 'departureTime', false)
  )
  const recordedAtTimestamp = get(event, 'tst', get(event, 'events[0].recordedAt', 0))

  const eventDate = useDate ? useDate : new Date(recordedAtTimestamp)
  const odayDate = getDateFromDateTime(operationDay)
  const diff = diffHours(eventDate, odayDate)

  const [hours, minutes, seconds] = journeyStartTime.split(':')
  let intHours = parseInt(hours, 10)

  /*
    If the eventMoment was more than a day after the operation day, we're probably
    dealing with a 24h+ journey. Also make sure that the start time hours are under 21,
    which was chosen as a time that shouldn't appear more than once in a 24h+ day.
    Thus, the maximum day length supported is 36h. After that things get weird.

    There must be an upper limit to intHours, otherwise times such as 23:59 get 24 hours
    added to them if the event happens after midnight. Not good.

    The diff check should be under 24 to also allow event times that are before the
    planned start times for journeys that teeter in the edge of midnight.
   */

  if (intHours <= 12 && Math.floor(diff) >= 23) {
    intHours = intHours + Math.max(1, Math.floor(diff / 24)) * 24
  }

  return getTimeString(intHours, minutes, seconds)
}

export function getJourneyEventTime(event: Vehicles) {
  if (!event.journey_start_time) {
    return ''
  }

  const timestampDate = parse(event.tst)

  let hours = timestampDate.getHours()
  const minutes = timestampDate.getMinutes()
  const seconds = timestampDate.getSeconds()

  if (event.oday !== format(timestampDate, 'YYYY-MM-DD')) {
    hours = hours + 24
  }

  return getTimeString(hours, minutes, seconds)
}

type JoreDepartureTime = {
  isNextDay: boolean
  hours: number
  minutes: number
  arrivalHours?: number
  arrivalMinutes?: number
  [index: string]: any
}

// Return the departure time as a 24h+ time string
export function getDepartureTime(
  departure: JoreDepartureTime,
  useArrival = false
): string {
  let { isNextDay, hours, minutes } = departure

  if (useArrival && departure.arrivalHours && departure.arrivalMinutes) {
    hours = departure.arrivalHours
    minutes = departure.arrivalMinutes
  }

  const hour = isNextDay ? hours + 24 : hours
  return getTimeString(hour, minutes)
}

// Return the real time of the departure as a Date
export function getRealDepartureDate(departure, date, useArrival): Date {
  const time = getDepartureTime(departure, useArrival)
  return getDateFromDateTime(date, time)
}
