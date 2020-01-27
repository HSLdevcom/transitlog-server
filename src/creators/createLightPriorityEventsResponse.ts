import { LightPriorityEvent } from '../types/generated/schema-types'
import { CachedFetcher } from '../types/CachedFetcher'
import { cacheFetch } from '../cache'
import { isToday } from 'date-fns'
import { DBLightPriorityEvent } from '../types/EventsDb'
import { AuthenticatedUser } from '../types/Authentication'
import { createLightPriorityEventObject } from '../objects/createLightPriorityEventObject'
import { uniqBy } from 'lodash'

export const createLightPriorityEventsResponse = async (
  user: AuthenticatedUser,
  getLightPriorityEvents: () => Promise<DBLightPriorityEvent[]>,
  date: string,
  skipCache: boolean = true
): Promise<LightPriorityEvent[]> => {
  const fetchEvents: CachedFetcher<LightPriorityEvent[]> = async () => {
    const lightPriorityEvents = await getLightPriorityEvents()

    // console.log('received e.g. tla event:', lightPriorityEvents[0])
    console.log('query returned', lightPriorityEvents.length, ' tla events')
    if (!lightPriorityEvents || lightPriorityEvents.length === 0) {
      return false
    }

    return uniqBy(lightPriorityEvents.map(createLightPriorityEventObject), 'requestId')
  }

  // Cache events for the current day for 5 seconds, otherwise 24 hours.
  const cacheTTL: number = isToday(date) ? 5 : 24 * 60 * 60
  const cacheKey = `light_priority_events_${date}`
  const events = await cacheFetch<LightPriorityEvent[]>(
    cacheKey,
    fetchEvents,
    cacheTTL,
    skipCache
  )

  if (!events) {
    return []
  }

  return events
}
