import { Cancellation } from '../types/generated/schema-types'
import { getLatestCancellationState } from '../utils/getLatestCancellationState'
import { DBCancellation } from '../types/EventsDb'
import { CachedFetcher } from '../types/CachedFetcher'
import { createCancellation } from './objects/createCancellation'
import { cacheFetch } from './cache'

export type CancellationSearchProps = {
  all?: boolean
  routeId?: string
  direction?: number
  departureTime?: string
  latestOnly?: boolean
}

export const getCancellations = async (
  fetchCancellations: (
    date: string,
    routeId?: string,
    direction?: number,
    departureTime?: string
  ) => DBCancellation[],
  date: string,
  cancellationSearchProps: CancellationSearchProps
): Promise<Cancellation[]> => {
  const { routeId, departureTime, direction, all, latestOnly = false } = cancellationSearchProps

  const cancellationFetcher: CachedFetcher<Cancellation[]> = async () => {
    const cancellations = await fetchCancellations(date, routeId, direction, departureTime)

    if (cancellations.length === 0) {
      return false
    }

    return cancellations.map((cancellation) => createCancellation(cancellation))
  }

  const cancellationsCacheKey =
    all || (!routeId && !direction && !departureTime)
      ? `all_cancellations_${date}`
      : `cancellations_${date}_${routeId || 'no-route'}_${direction ||
          'no-direction'}_${departureTime || 'no-time'}`

  let cancellations = await cacheFetch<Cancellation[]>(
    cancellationsCacheKey,
    cancellationFetcher,
    24 * 60 * 60
  )

  if (!cancellations) {
    return []
  }

  if (latestOnly) {
    // If requested, only the latest info existing about a departure is returned.
    cancellations = getLatestCancellationState(cancellations)
  }

  return cancellations
}
