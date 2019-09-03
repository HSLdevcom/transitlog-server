import { Cancellation } from '../types/generated/schema-types'
import { getLatestCancellationState } from '../utils/getLatestCancellationState'
import { DBCancellation } from '../types/EventsDb'
import { CachedFetcher } from '../types/CachedFetcher'
import { createCancellation } from './objects/createCancellation'
import { cacheFetch } from './cache'
import { getDirection } from '../utils/getDirection'
import { getDateFromDateTime } from '../utils/time'

export type CancellationSearchProps = {
  all?: boolean
  routeId?: string
  direction?: number
  departureTime?: string
  latestOnly?: boolean
}

export const getCancellations = async (
  fetchCancellations: (date: string) => DBCancellation[],
  date: string,
  cancellationSearchProps: CancellationSearchProps
): Promise<Cancellation[]> => {
  const { routeId, departureTime, direction, all, latestOnly = false } = cancellationSearchProps

  const cancellationFetcher: CachedFetcher<Cancellation[]> = async () => {
    const cancellations = await fetchCancellations(date)

    if (cancellations.length === 0) {
      return false
    }

    return cancellations.map((cancellation) => createCancellation(cancellation))
  }

  const cancellationsCacheKey = `cancellations_${date}`
  let cancellations = await cacheFetch<Cancellation[]>(
    cancellationsCacheKey,
    cancellationFetcher,
    24 * 60 * 60
  )

  if (!cancellations) {
    return []
  }

  if (all) {
    return cancellations
  }

  if (latestOnly) {
    // If requested, only the latest info existing about a departure is returned.
    cancellations = getLatestCancellationState(cancellations)
  }

  let filteredCancellations: Cancellation[] = cancellations

  if (routeId) {
    filteredCancellations = filteredCancellations.filter((cancellation) => {
      let match = cancellation.routeId === routeId

      if (!direction && !departureTime) {
        return match
      }

      if (direction) {
        match = match && getDirection(direction) === cancellation.direction
      }

      if (departureTime) {
        match = match && departureTime.startsWith(cancellation.journeyStartTime)
      }

      return match
    })
  }

  return filteredCancellations
}
