import moment, { Moment } from 'moment-timezone'
import { TZ } from '../constants'
import {
  Alert,
  AlertCategory,
  Cancellation,
  CancellationEffect,
  CancellationSubcategory,
  CancellationType,
} from '../types/generated/schema-types'
import { getDateFromDateTime } from '../utils/time'
import { orderBy, mapValues } from 'lodash'
import { isMoment } from 'moment'

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
    lastModifiedDateTime: getDateFromDateTime(date, '05:44:00'),
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
    lastModifiedDateTime: getDateFromDateTime(date, '05:58:00'),
  },
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
    lastModifiedDateTime: getDateFromDateTime(date, '06:00:00'),
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
    lastModifiedDateTime: getDateFromDateTime(date, '06:04:00'),
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
    lastModifiedDateTime: getDateFromDateTime(date, '07:36:00'),
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
    lastModifiedDateTime: getDateFromDateTime(date, '08:14:00'),
  },
]

type CancellationSearchProps = {
  all?: boolean
  routeId?: string
  direction?: number
  departureTime?: string
}

export const getCancellations = (
  dateTime: Moment | string,
  cancellationSearchProps: CancellationSearchProps,
  onlyLatestState = false
) => {
  const time = moment.tz(dateTime, TZ)
  const date = time.format('YYYY-MM-DD')

  const selectedCancellations = availableCancellations(date)
    .filter((cancellation) => {
      if (cancellationSearchProps.all) {
        return true
      }

      if (cancellationSearchProps.routeId === cancellation.routeId) {
        if (
          cancellationSearchProps.direction &&
          cancellationSearchProps.direction !== cancellation.direction
        ) {
          return false
        }

        if (
          cancellationSearchProps.departureTime &&
          cancellationSearchProps.departureTime !== cancellation.journeyStartTime
        ) {
          return false
        }

        return true
      }

      return false
    })
    .filter((cancellation) => cancellation.departureDate === date)

  if (selectedCancellations.length === 0) {
    return []
  }

  let returnCancellations: Cancellation[] = orderBy<Cancellation>(
    selectedCancellations,
    [({ lastModifiedDateTime }) => lastModifiedDateTime.unix(), 'journeyStartTime'],
    ['desc', 'asc']
  )

  if (onlyLatestState) {
    // If requested, only the latest info existing about a departure is returned.
    returnCancellations = returnCancellations.reduce(
      (latest: Cancellation[], cancellation, index, allCancellations: Cancellation[]) => {
        const previousCancellation = allCancellations.find(
          (c) =>
            c.routeId === cancellation.routeId &&
            c.direction === cancellation.direction &&
            c.departureDate === cancellation.departureDate &&
            c.journeyStartTime === cancellation.journeyStartTime &&
            c.isCancelled !== cancellation.isCancelled &&
            c.lastModifiedDateTime.isAfter(cancellation.lastModifiedDateTime)
        )

        if (!previousCancellation) {
          latest.push(cancellation)
        }

        return latest
      },
      []
    )
  }

  return returnCancellations.map((cancellation) =>
    mapValues(cancellation, (val) => (isMoment(val) ? val.toISOString(true) : val))
  )
}
