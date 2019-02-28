import moment from 'moment-timezone'
import { doubleDigit } from './doubleDigit'
import { TZ } from '../constants'

const num = (val) => parseInt(val, 10)

export function timeToSeconds(timeStr = '') {
  const [hours = 0, minutes = 0, seconds = 0] = (timeStr || '').split(':')
  return num(seconds) + num(minutes) * 60 + num(hours) * 60 * 60
}

export function secondsToTimeObject(seconds) {
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

export function secondsToTime(secondsDuration) {
  const { hours = 0, minutes = 0, seconds = 0 } = secondsToTimeObject(secondsDuration)
  return getTimeString(hours, minutes, seconds)
}

export function getNormalTime(time) {
  let [hours = 0, minutes = 0, seconds = 0] = time.split(':')

  if (parseInt(hours, 10) > 23) {
    hours = hours - 24
  }

  return getTimeString(hours, minutes, seconds)
}

export function getTimeString(hours = 0, minutes = 0, seconds = 0) {
  return `${doubleDigit(hours)}:${doubleDigit(minutes)}:${doubleDigit(seconds)}`
}

export function getMomentFromDateTime(date, time = '00:00:00', timezone = TZ) {
  // Get the seconds elapsed during the date. The time can be a 24h+ time.
  const seconds = timeToSeconds(time)
  // Create a moment from the date and add the seconds.
  return moment.tz(date, timezone).add(seconds, 'seconds')
}

// Get the (potentially) 24h+ time of the journey.
// For best results, pass in the observed start time as useMoment, but if that's
// not available, use the time of the first event from this journey that you have.
export function journeyStartTime(event, useMoment) {
  if (!event || !event.journey_start_time) {
    return ''
  }

  const eventMoment = useMoment ? useMoment : moment.tz(event.tst, TZ)
  const odayMoment = getMomentFromDateTime(event.oday)
  const diff = eventMoment.diff(odayMoment, 'hours')

  const [hours, minutes, seconds] = event.journey_start_time.split(':')
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

export function journeyEventTime(event) {
  if (!event || !event.journey_start_time) {
    return ''
  }

  const receivedAtMoment = moment.tz(event.tst, TZ)

  let hours = receivedAtMoment.hours()
  const minutes = receivedAtMoment.minutes()
  const seconds = receivedAtMoment.seconds()

  if (event.oday !== receivedAtMoment.format('YYYY-MM-DD')) {
    hours = hours + 24
  }

  return getTimeString(hours, minutes, seconds)
}

// Return the departure time as a 24h+ time string
export function departureTime(departure, useArrival = false) {
  let { isNextDay, hours, minutes } = departure

  if (useArrival) {
    hours = departure.arrivalHours
    minutes = departure.arrivalMinutes
  }

  const hour = isNextDay ? hours + 24 : hours
  return getTimeString(hour, minutes)
}
