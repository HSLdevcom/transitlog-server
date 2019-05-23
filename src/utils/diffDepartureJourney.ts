import moment from 'moment-timezone'
import { getRealDepartureDate } from './time'
import { TZ } from '../constants'
import { Departure } from '../types/generated/schema-types'
import { Vehicles } from '../types/EventsDb'

export function diffDepartureJourney(
  journey: Vehicles,
  departure: Departure,
  date: string,
  useArrival: boolean = false
): number {
  const observedDepartureTime = moment.tz(journey.tst, TZ)
  const plannedDepartureTime = getRealDepartureDate(departure, date, useArrival)
  return observedDepartureTime.diff(plannedDepartureTime, 'seconds')
}
