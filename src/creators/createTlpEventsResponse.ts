import { TlpEvent } from '../types/generated/schema-types'
import { CachedFetcher } from '../types/CachedFetcher'
import { cacheFetch } from '../cache'
import { isToday } from 'date-fns'
import { DBTlpEvent } from '../types/EventsDb'
import { AuthenticatedUser } from '../types/Authentication'
import { createTlpEventObject } from '../objects/createTlpEventObject'
import { uniqBy } from 'lodash'

export type tlpEventSearchProps = {
  all?: boolean
  junctionId?: number
  signalGroupId?: number
  signalGroupNbr?: number
}

export const createTlpEventsResponse = async (
  user: AuthenticatedUser,
  getTlpEvents: () => Promise<DBTlpEvent[]>,
  date: string,
  tlpEventSearchProps: tlpEventSearchProps,
  skipCache: boolean = true
): Promise<TlpEvent[]> => {
  const { all, junctionId, signalGroupId, signalGroupNbr } = tlpEventSearchProps
  const fetchEvents: CachedFetcher<TlpEvent[]> = async () => {
    const tlpEvents = await getTlpEvents()

    // console.log('received e.g. tla event:', tlpEvents[0])
    console.log('query returned', tlpEvents.length, ' tla events')
    if (!tlpEvents || tlpEvents.length === 0) {
      return false
    }

    return uniqBy(tlpEvents.map(createTlpEventObject), 'requestId')
  }

  // Cache events for the current day for 5 seconds, otherwise 24 hours.
  const cacheTTL: number = isToday(date) ? 5 : 24 * 60 * 60
  const cacheKey = `tlp_events_${date}_${all}_${junctionId}_${signalGroupId}_${signalGroupNbr}`
  const events = await cacheFetch<TlpEvent[]>(cacheKey, fetchEvents, cacheTTL, skipCache)

  if (!events) {
    return []
  }

  return events
}
