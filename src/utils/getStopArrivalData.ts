import moment from 'moment-timezone'
import { diffDepartureJourney } from './diffDepartureJourney'
import parse from 'date-fns/parse'
import format from 'date-fns/format'
import { DATE_FORMAT, TZ } from '../constants'
import { Departure, ObservedArrival } from '../types/generated/schema-types'
import { get } from 'lodash'
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
