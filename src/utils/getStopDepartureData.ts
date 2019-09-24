import { diffDepartureJourney } from './diffDepartureJourney'
import { Departure, ObservedDeparture } from '../types/generated/schema-types'
import format from 'date-fns/format'
import parse from 'date-fns/parse'
import { DATE_FORMAT, TZ } from '../constants'
import moment from 'moment-timezone'
import { getJourneyEventTime } from './time'
import { createDepartureId } from '../app/objects/createDepartureObject'
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
  const departureEvent = getStopDepartureEvent(stopEvents)

  if (!departureEvent) {
    return null
  }

  const tst = departureEvent.tst
  const departureTime = parse(tst)

  const departureDate = !date
    ? get(stopDeparture, 'plannedDepartureTime.departureDate', departureEvent.oday)
    : date

  const departureDiff = diffDepartureJourney(departureEvent, stopDeparture, departureDate)
  const journeyId = createJourneyId(departureEvent)

  // @ts-ignore
  return {
    id: `odt_${journeyId}_${tst}_${createDepartureId(stopDeparture)}`,
    departureDate: format(departureTime, DATE_FORMAT),
    departureTime: getJourneyEventTime(departureEvent),
    departureDateTime: moment.tz(departureTime, TZ).toISOString(true),
    departureTimeDifference: departureDiff,
  }
}

export const getStopDepartureEvent = (events) => {
  let departureEvent = events.find((event) => event.event_type === 'DEP')

  if (!departureEvent) {
    departureEvent = events[0]

    if (!departureEvent) {
      return null
    }
  }

  return departureEvent
}
