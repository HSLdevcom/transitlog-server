import { diffDepartureJourney } from './diffDepartureJourney'
import { Vehicles } from '../types/generated/hfp-types'
import { PlannedDeparture } from '../types/PlannedDeparture'
import { Departure, ObservedDeparture } from '../types/generated/schema-types'
import { createJourneyEventObject } from '../app/objects/createJourneyEventObject'
import { TZ } from '../constants'
import moment from 'moment-timezone'
import { getJourneyEventTime } from './time'

/**
 *
 * @param stopEvents positions with next_stop_id = [current stop]
 * @param stopDeparture the planned departure from [current stop]
 * @param date selected date in YYYY-MM-DD format
 * @returns {*}
 */
export const getStopDepartureData = (
  stopEvents: Vehicles[] = [],
  stopDeparture: PlannedDeparture | Departure,
  date: string
): ObservedDeparture | null => {
  // The stopEvents are sorted by recorded-at time in descending order,
  // so the last event from this stop is first. Exactly like we want it.
  const departureEvent = stopEvents[0]

  if (!departureEvent) {
    return null
  }

  const departureDiff = diffDepartureJourney(departureEvent, stopDeparture, date)

  return {
    departureEvent: createJourneyEventObject(departureEvent),
    departureDate: departureEvent.oday,
    departureTime: getJourneyEventTime(departureEvent),
    departureDateTime: moment.tz(departureEvent.tst, TZ).toISOString(true),
    departureTimeDifference: departureDiff,
  }
}
