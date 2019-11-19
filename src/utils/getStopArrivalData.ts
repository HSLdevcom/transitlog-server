import moment from 'moment-timezone'
import { diffDepartureJourney } from './diffDepartureJourney'
import parse from 'date-fns/parse'
import format from 'date-fns/format'
import { DATE_FORMAT, TZ } from '../constants'
import { Departure, ObservedArrival } from '../types/generated/schema-types'
import { get, reverse } from 'lodash'
import { createJourneyId } from './createJourneyId'
import { createDepartureId } from '../objects/createDepartureObject'
import { Vehicles } from '../types/EventsDb'
import { getJourneyEventTime } from './time'

export function getStopArrivalData(
  arrivalEvent: Vehicles | null = null,
  stopDeparture: Departure,
  date?: string
): ObservedArrival | null {
  if (!arrivalEvent) {
    return null
  }

  const tst = arrivalEvent.tst
  const arrivalTime = parse(tst)

  const arrivalDate = !date
    ? get(stopDeparture, 'plannedArrivalTime.arrivalDate', arrivalEvent.oday)
    : date

  const arrivalDiff = diffDepartureJourney(arrivalEvent, stopDeparture, arrivalDate, true)
  const journeyId = createJourneyId(arrivalEvent)

  // @ts-ignore
  return {
    id: `oat_${journeyId}_${tst}_${createDepartureId(stopDeparture)}`,
    arrivalDate: format(arrivalTime, DATE_FORMAT),
    arrivalTime: getJourneyEventTime(arrivalEvent),
    arrivalDateTime: moment.tz(arrivalTime, TZ).toISOString(true),
    arrivalTimeDifference: arrivalDiff,
  }
}

export const getLegacyStopArrivalEvent = (events) => {
  const reversedEvents = reverse([...events])
  let arrivalEvent = reversedEvents[0]

  if (!arrivalEvent) {
    return null
  }

  for (const evt of reversedEvents) {
    if (evt.drst) {
      arrivalEvent = evt
      break
    }
  }

  return arrivalEvent
}

export const getStopArrivalEvent = (events) => {
  if (!events || events.length === 0) {
    return null
  }

  let lookForType = 'ARS'
  let departureEvent = events.find((event) => event.event_type === lookForType)

  if (!departureEvent) {
    // Fall back to other type of event
    lookForType = 'ARR'
    departureEvent = events.find((event) => event.event_type === lookForType)

    // If still not found, just get the first event from what we have
    if (!departureEvent) {
      departureEvent = events[0] || null
    }
  }

  return departureEvent
}
