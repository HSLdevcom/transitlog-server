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

  const { tst, loc = null } = departureEvent
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
    loc,
  }
}

export const getStopDepartureEvent = (events, requireDep: boolean = false) => {
  if (!events || events.length === 0) {
    return null
  }

  const validEventTypes = [requireDep ? 'DEP' : 'PDE', 'PAS']
  let departureEvent: Vehicles | null = null

  for (const validType of validEventTypes) {
    departureEvent = events.find((event) => event.event_type === validType)

    if (departureEvent) {
      break
    } else {
      departureEvent = null
    }
  }

  if (!departureEvent) {
    departureEvent = events[0] || null
  }

  return departureEvent
}
