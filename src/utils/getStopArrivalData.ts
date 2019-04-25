import moment from 'moment-timezone'
import { diffDepartureJourney } from './diffDepartureJourney'
import { Vehicles } from '../types/generated/hfp-types'
import parse from 'date-fns/parse'
import format from 'date-fns/format'
import { DATE_FORMAT, TIME_FORMAT, TZ } from '../constants'
import { createJourneyEventObject } from '../app/objects/createJourneyEventObject'
import { Departure, ObservedArrival } from '../types/generated/schema-types'
import { reverse } from 'lodash'
import { createJourneyId } from './createJourneyId'
import { createDepartureId } from '../app/objects/createDepartureObject'

export function getStopArrivalData(
  stopEvents: Vehicles[] = [],
  stopDeparture: Departure,
  date: string
): ObservedArrival | null {
  // The stopEvents are sorted by recorded-at time in descending order,
  // so the last event from this stop is first. For this function,
  // it is best to reverse it back to first-last order.
  const reversedEvents = reverse([...stopEvents])
  let arrivalEvent = reversedEvents[0]

  if (!arrivalEvent) {
    return null
  }

  // TODO: Make this better once we have HFP 2.0

  // Find out when the vehicle arrived at the stop
  // by looking at when the doors were opened.
  let doorDidOpen = false

  for (let i = 0; i < reversedEvents.length; i++) {
    const evt = reversedEvents[i]

    if (!!evt.drst) {
      doorDidOpen = true
      const pickIdx = i > 0 ? i - 1 : 0
      arrivalEvent = reversedEvents[pickIdx]
      break
    }
  }

  // If the loop didn't find an event, pick the last event for the stop as a fallback.
  if (!arrivalEvent) {
    arrivalEvent = reversedEvents[reversedEvents.length - 1]
  }

  const tst = arrivalEvent.tst
  const arrivalTime = parse(tst)

  const journeyId = createJourneyId(arrivalEvent)

  return {
    id: `oat_${journeyId}_${arrivalTime}_${createDepartureId(stopDeparture)}`,
    arrivalEvent: createJourneyEventObject(arrivalEvent, journeyId),
    arrivalDate: format(arrivalTime, DATE_FORMAT),
    arrivalTime: format(arrivalTime, TIME_FORMAT),
    // Yes, tst is iso 8601 already but in UTC. We want the local timezone.
    arrivalDateTime: moment.tz(arrivalTime, TZ).toISOString(true),
    arrivalTimeDifference: diffDepartureJourney(arrivalEvent, stopDeparture, date),
    doorDidOpen,
  }
}
