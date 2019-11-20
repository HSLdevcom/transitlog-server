import { diffDepartureJourney } from './diffDepartureJourney'
import { Departure, ObservedDeparture } from '../types/generated/schema-types'
import format from 'date-fns/format'
import parse from 'date-fns/parse'
import { DATE_FORMAT, TZ } from '../constants'
import moment from 'moment-timezone'
import { getJourneyEventTime } from './time'
import { createDepartureId } from '../objects/createDepartureObject'
import { createJourneyId } from './createJourneyId'
import { get } from 'lodash'
import { Vehicles } from '../types/EventsDb'

/**
 *
 * @param departureEvent
 * @param stopDeparture the planned departure from [current stop]
 * @param date selected date in YYYY-MM-DD format. If not passed,
 *  it will be inferred from the departure or event.
 * @returns {*}
 */
export const getStopDepartureData = (
  departureEvent: Vehicles | null = null,
  stopDeparture: Departure,
  date?: string
): ObservedDeparture | null => {
  if (!departureEvent) {
    return null
  }

  const { tst } = departureEvent
  const eventTime = parse(tst)

  const departureDate = !date
    ? get(stopDeparture, 'plannedDepartureTime.departureDate', departureEvent.oday)
    : date

  const departureDiff = diffDepartureJourney(departureEvent, stopDeparture, departureDate)
  const journeyId = createJourneyId(departureEvent)

  // @ts-ignore
  return {
    id: `odt_${journeyId}_${tst}_${createDepartureId(stopDeparture)}`,
    departureDate: format(eventTime, DATE_FORMAT),
    departureTime: getJourneyEventTime(departureEvent),
    departureDateTime: moment.tz(eventTime, TZ).toISOString(true),
    departureTimeDifference: departureDiff,
  }
}

export const getStopDepartureEvent = (events, preferDep: boolean = false) => {
  if (!events || events.length === 0) {
    return null
  }

  const lookForEvents = [preferDep ? 'DEP' : 'PDE', preferDep ? 'PDE' : 'DEP', 'PAS']
  let departureEvent: Vehicles | null = null

  for (const lookForType of lookForEvents) {
    departureEvent = events.find((event) => event.event_type === lookForType)

    if (departureEvent) {
      break
    }
  }

  if (!departureEvent) {
    departureEvent = events[0] || null
  }

  return departureEvent
}
