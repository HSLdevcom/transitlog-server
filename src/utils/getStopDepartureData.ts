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
 * @param stopEvents positions with next_stop_id = [current stop]
 * @param stopDeparture the planned departure from [current stop]
 * @param date selected date in YYYY-MM-DD format. If not passed,
 *  it will be inferred from the departure or event.
 * @returns {*}
 */
export const getStopDepartureData = (
  stopEvents: Vehicles[] = [],
  stopDeparture: Departure,
  date?: string
): ObservedDeparture | null => {
  // Timing stops and origin stops use DEP (exit stop radius) as the
  // departure event, but normal stops use PDE (doors closed).
  const useDEP = stopDeparture.isTimingStop || stopDeparture.isOrigin
  const departureEvent = getStopDepartureEvent(stopEvents, !!useDEP)

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

  let lookForType = preferDep ? 'DEP' : 'PDE'
  let departureEvent = events.find((event) => event.event_type === lookForType)

  if (!departureEvent) {
    // Fall back to other type of event
    lookForType = lookForType === 'DEP' ? 'PDE' : 'DEP'
    departureEvent = events.find((event) => event.event_type === lookForType)

    // If still not found, just get the first event from what we have
    if (!departureEvent) {
      departureEvent = events[0] || null
    }
  }

  return departureEvent
}
