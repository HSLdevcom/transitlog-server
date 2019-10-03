import { Cancellation } from '../types/generated/schema-types'
import moment from 'moment-timezone'

export const getLatestCancellationState = (
  cancellations: Cancellation[] = []
): Cancellation[] => {
  return cancellations.reduce(
    (latest: Cancellation[], cancellation, index, allCancellations: Cancellation[]) => {
      const previousCancellation = allCancellations.find(
        (c) =>
          c.routeId === cancellation.routeId &&
          c.direction === cancellation.direction &&
          c.departureDate === cancellation.departureDate &&
          c.journeyStartTime === cancellation.journeyStartTime &&
          c.isCancelled !== cancellation.isCancelled &&
          (c.lastModifiedDateTime &&
            moment.isMoment(c.lastModifiedDateTime) &&
            c.lastModifiedDateTime.isAfter(cancellation.lastModifiedDateTime))
      )

      if (!previousCancellation) {
        latest.push(cancellation)
      }

      return latest
    },
    []
  )
}
