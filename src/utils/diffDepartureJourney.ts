import get from 'lodash/get'
import moment from 'moment-timezone'
import { getRealDepartureDate } from './time'
import { TZ } from '../constants'
import { Vehicles } from '../types/generated/hfp-types'
import { PlannedDeparture } from '../types/PlannedDeparture'
import { Departure } from '../types/generated/schema-types'

export function diffDepartureJourney(
  journey: Vehicles,
  departure: PlannedDeparture | Departure,
  date: string,
  useArrival: boolean = false
): number {
  const observedDepartureTime = moment.tz(journey.tst, TZ)
  const plannedDepartureTime = getRealDepartureDate(departure, date, useArrival)
  return observedDepartureTime.diff(plannedDepartureTime, 'seconds')
}
