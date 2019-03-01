import moment from 'moment-timezone'
import { diffDepartureJourney } from './diffDepartureJourney'
import { Vehicles } from '../types/generated/hfp-types'
import { PlannedDeparture } from '../types/PlannedDeparture'
import parse from 'date-fns/parse'
import format from 'date-fns/format'
import { DATE_FORMAT, TIME_FORMAT, TZ } from '../constants'
import { createJourneyEventObject } from '../app/objects/createJourneyEventObject'
import { ObservedArrival } from '../types/generated/schema-types'

export function getStopArrivalData(
  stopPositions: Vehicles[] = [],
  stopDeparture: PlannedDeparture,
  date: string
): ObservedArrival | null {
  let arrivalEvent = stopPositions[0]

  if (!arrivalEvent) {
    return null
  }

  // Find out when the vehicle arrived at the stop
  // by looking at when the doors were opened.
  let doorDidOpen = false

  if (arrivalEvent) {
    for (let i = 0; i < stopPositions.length; i++) {
      const position = stopPositions[i]

      if (doorDidOpen && !position.drst) {
        arrivalEvent = stopPositions[i - 1]

        // If that didn't exist, just pick the current item as a fallback.
        if (!arrivalEvent) {
          arrivalEvent = stopPositions[i]
        }
        break
      }

      if (!doorDidOpen && !!position.drst) {
        doorDidOpen = true
      }
    }
  }

  if (!arrivalEvent) {
    return null
  }

  const tst = arrivalEvent.tst
  const arrivalTime = parse(tst)

  return {
    arrivalEvent: createJourneyEventObject(arrivalEvent),
    arrivalDate: format(arrivalTime, DATE_FORMAT),
    arrivalTime: format(arrivalTime, TIME_FORMAT),
    // Yes, tst is iso 8601 already but in UTC. We want the local timezone.
    arrivalDateTime: moment.tz(arrivalTime, TZ).toISOString(true),
    arrivalTimeDifference: diffDepartureJourney(arrivalEvent, stopDeparture, date),
    doorDidOpen,
  }
}
