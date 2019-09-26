import {
  AreaEventsFilterInput,
  DateTime,
  AreaJourney,
  PreciseBBox,
} from '../types/generated/schema-types'
import { CachedFetcher } from '../types/CachedFetcher'
import { cacheFetch } from './cache'
import { groupBy, map } from 'lodash'
import { createAreaJourneyObject } from './objects/createAreaJourneyObject'
import { createBBoxString } from '../utils/createBBoxString'
import { createJourneyId } from '../utils/createJourneyId'
import { Vehicles } from '../types/EventsDb'
import { AuthenticatedUser } from '../types/Authentication'
import { getUserGroups, requireUser } from '../auth/requireUser'

export const createAreaJourneysResponse = async (
  getAreaJourneys: () => Promise<Vehicles[] | null>,
  minTime: DateTime,
  maxTime: DateTime,
  bbox: PreciseBBox,
  date: string,
  filters: AreaEventsFilterInput,
  unsignedEvents: boolean = true,
  user: AuthenticatedUser | null = null
): Promise<AreaJourney[]> => {
  const fetchJourneys: CachedFetcher<AreaJourney[]> = async () => {
    const areaJourneys = await getAreaJourneys()

    if (!areaJourneys || areaJourneys.length === 0) {
      return false
    }

    return map(
      groupBy(areaJourneys, (event) => {
        if (event.journey_type === 'journey') {
          return createJourneyId(event)
        }

        return `${event.journey_type}_${event.unique_vehicle_id}`
      }),
      (events: Vehicles[]) => createAreaJourneyObject(events)
    )
  }

  // Cache for when a link containing an area query is shared.
  const cacheKey = `area_journeys_${createBBoxString(bbox)}_${minTime}_${maxTime}_${date}_${
    !!user && unsignedEvents ? 'unsigned' : ''
  }`
  const journeys = await cacheFetch<AreaJourney[]>(cacheKey, fetchJourneys, 10 * 60)

  if (!journeys) {
    return []
  }

  // HSL users are allowed to see all events
  if (requireUser(user, 'HSL')) {
    return journeys
  }

  let authorizedJourneys = journeys

  const operatorGroups: string[] = getUserGroups(user)
    .map((group) => group.replace('op_', ''))
    .filter((group) => !!group)

  authorizedJourneys = authorizedJourneys.filter((journey) => {
    if (journey.journeyType === 'journey') {
      return true
    }

    if (operatorGroups.length === 0) {
      return false
    }

    if (journey.operatorId) {
      const operator = journey.operatorId
      return operatorGroups.includes(operator)
    }

    return false
  })

  return authorizedJourneys
}
