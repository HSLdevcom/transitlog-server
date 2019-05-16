import moment, { Moment } from 'moment-timezone'
import { TZ } from '../constants'
import {
  AlertCategory,
  Cancellation,
  CancellationEffect,
  CancellationSubcategory,
  CancellationType,
} from '../types/generated/schema-types'
import { getDateFromDateTime } from '../utils/time'

// Mock alert data
const availableCancellations = (date): Cancellation[] => [
  {
    title: `Route 1018 alien abduction`,
    routeId: '1018',
    direction: 1,
    description: 'An alien abducted the driver.',
    departureDate: date,
    journeyStartTime: '06:07',
    category: AlertCategory.NoDriver,
    subCategory: CancellationSubcategory.AssaultOnDriver,
    cancellationType: CancellationType.CancelDeparture,
    cancellationEffect: CancellationEffect.CancelEntireDeparture,
    isCancelled: true,
    publishedDateTime: getDateFromDateTime(date, '06:00:00'),
  },
  {
    title: `Route 1018 alien abduction`,
    routeId: '1018',
    direction: 1,
    description: 'The aliens returned the driver.',
    departureDate: date,
    journeyStartTime: '06:07',
    category: AlertCategory.NoDriver,
    subCategory: CancellationSubcategory.AssaultOnDriver,
    cancellationType: CancellationType.CancelDeparture,
    cancellationEffect: CancellationEffect.CancelEntireDeparture,
    isCancelled: false,
    publishedDateTime: getDateFromDateTime(date, '06:02:00'),
  },
  {
    title: `Vandalism on route 1018`,
    routeId: '1018',
    direction: 2,
    description:
      'A vandal from Vantaa has punctured the tires of a vehicle that as supposed to drive this route as they were unhappy to be placed in Zone C.',
    departureDate: date,
    journeyStartTime: '07:43',
    category: AlertCategory.Assault,
    subCategory: CancellationSubcategory.AssaultOnVehicle,
    cancellationType: CancellationType.CancelDeparture,
    cancellationEffect: CancellationEffect.CancelEntireDeparture,
    isCancelled: true,
    publishedDateTime: getDateFromDateTime(date, '07:36:00'),
  },
  {
    title: `Ruote 1018 road blocked`,
    routeId: '1018',
    direction: 2,
    description:
      'Someone from Eira parked their big and expensive SUV in the middle of the road blocking all traffic.',
    departureDate: date,
    journeyStartTime: '08:23',
    category: AlertCategory.MisparkedVehicle,
    subCategory: CancellationSubcategory.MissparkedVehicle,
    cancellationType: CancellationType.CancelDeparture,
    cancellationEffect: CancellationEffect.CancelStopsFromMiddle,
    isCancelled: true,
    publishedDateTime: getDateFromDateTime(date, '08:14:00'),
  },
]

type CancellationSearchProps = {
  routeId?: string
  direction?: number
  departureTime?: string
  cancelledCancellations?: boolean
}

export const getCancellations = (
  dateTime: Moment | string,
  cancellationSearchProps: CancellationSearchProps,
  onlyLatestState = false
) => {
  const time = moment.tz(dateTime, TZ)
  const date = time.format('YYYY-MM-DD')

  // If this function was supplied only a date string, include all cancellations
  // for this date regardless of time.
  const includeAllForDate = dateTime === date

  return []
}
