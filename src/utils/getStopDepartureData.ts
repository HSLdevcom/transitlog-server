import { diffDepartureJourney } from './diffDepartureJourney'
import { Vehicles } from '../types/generated/hfp-types'
import { PlannedDeparture } from '../types/PlannedDeparture'
import { Departure, ObservedDeparture } from '../types/generated/schema-types'
import { createJourneyEventObject } from '../app/objects/createJourneyEventObject'
import { TZ } from '../constants'
import moment from 'moment-timezone'
import { getJourneyEventTime } from './time'
import { createDepartureId } from '../app/objects/createDepartureObject'
import { createJourneyId } from './createJourneyId'
import { get } from 'lodash'

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
  stopDeparture: PlannedDeparture | Departure,
  date?: string
): ObservedDeparture | null => {
  // The stopEvents are sorted by recorded-at time in descending order,
  // so the last event from this stop is first. Exactly like we want it.
  const departureEvent = stopEvents[0]

  if (!departureEvent) {
    return null
  }

  const departureDate = !date
    ? get(stopDeparture, 'plannedDepartureTime.departureDate', departureEvent.oday)
    : date

  const departureDiff = diffDepartureJourney(departureEvent, stopDeparture, departureDate)
  const journeyId = createJourneyId(departureEvent)

  return {
    id: `odt_${journeyId}_${departureEvent.tst}_${createDepartureId(stopDeparture)}`,
    departureEvent: createJourneyEventObject(departureEvent, journeyId),
    departureDate: departureEvent.oday,
    departureTime: getJourneyEventTime(departureEvent),
    departureDateTime: moment.tz(departureEvent.tst, TZ).toISOString(true),
    departureTimeDifference: departureDiff,
  }
}
