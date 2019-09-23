import moment from 'moment-timezone'
import { diffDepartureJourney } from './diffDepartureJourney'
import parse from 'date-fns/parse'
import format from 'date-fns/format'
import { DATE_FORMAT, TZ } from '../constants'
import { Departure, ObservedArrival } from '../types/generated/schema-types'
import { get, reverse } from 'lodash'
import { createJourneyId } from './createJourneyId'
import { createDepartureId } from '../app/objects/createDepartureObject'
import { Vehicles } from '../types/EventsDb'
import { getJourneyEventTime } from './time'

export function getStopArrivalData(
  stopEvents: Vehicles[] = [],
  stopDeparture: Departure,
  date?: string
): ObservedArrival | null {
  const arrivalEvent = stopEvents.find((event) => event.event_type === 'ARR')

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
  // The stopEvents are sorted by recorded-at time in descending order,
  // so the last event from this stop is first. For this function,
  // it is best to reverse it back to first-last order.
  const reversedEvents = reverse([...events])
  let arrivalEvent = reversedEvents[0]
  let doorOpenEvent = null

  if (!arrivalEvent) {
    return [null]
  }

  // Find out when the vehicle arrived at the stop
  // by looking at when the doors were opened.
  let doorDidOpen = false

  for (let i = 0; i < reversedEvents.length; i++) {
    const evt = reversedEvents[i]

    if (!!evt.drst) {
      doorDidOpen = true
      doorOpenEvent = evt

      const pickIdx = i > 0 ? i - 1 : 0
      arrivalEvent = reversedEvents[pickIdx]
      break
    }
  }

  // If the loop didn't find an event, pick the last event for the stop as a fallback.
  if (!arrivalEvent) {
    arrivalEvent = reversedEvents[reversedEvents.length - 1]
  }

  return [arrivalEvent, doorOpenEvent]
}
