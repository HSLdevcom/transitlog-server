import { diffDepartureJourney } from './diffDepartureJourney'
import { Vehicles } from '../types/generated/hfp-types'
import { PlannedDeparture } from '../types/PlannedDeparture'
import { ObservedDeparture } from '../types/generated/schema-types'
import { createJourneyEventObject } from '../app/objects/createJourneyEventObject'
import parse from 'date-fns/parse'
import format from 'date-fns/format'
import { DATE_FORMAT, TIME_FORMAT, TZ } from '../constants'
import moment from 'moment-timezone'

/**
 *
 * @param stopEvents positions with next_stop_id = [current stop]
 * @param stopDeparture the planned departure from [current stop]
 * @param date selected date in YYYY-MM-DD format
 * @returns {*}
 */
export const getStopDepartureData = (
  stopEvents: Vehicles[] = [],
  stopDeparture: PlannedDeparture,
  date: string
): ObservedDeparture | null => {
  // The stopEvents are sorted by recorded-at time in descending order,
  // so the last event from this stop is first. Exactly like we want it.
  const departureEvent = stopEvents[0]

  if (!departureEvent) {
    return null
  }

  const departureDiff = diffDepartureJourney(departureEvent, stopDeparture, date)

  const tst = departureEvent.tst
  const departureTime = parse(tst)

  return {
    departureEvent: createJourneyEventObject(departureEvent),
    departureDate: format(departureTime, DATE_FORMAT),
    departureTime: format(departureTime, TIME_FORMAT),
    departureDateTime: moment.tz(departureTime, TZ).toISOString(true),
    departureTimeDifference: departureDiff,
  }
}
