import { AreaEventsFilterInput, Journey, Scalars } from '../types/generated/schema-types'
import { CachedFetcher } from '../types/CachedFetcher'
import { cacheFetch } from '../cache'
import { groupBy, map } from 'lodash'
import { createAreaJourneyObject } from '../objects/createAreaJourneyObject'
import { createBBoxString } from '../utils/createBBoxString'
import { createJourneyId } from '../utils/createJourneyId'
import { Vehicles } from '../types/EventsDb'
import { AuthenticatedUser } from '../types/Authentication'
import { getUserGroups, requireUser } from '../auth/requireUser'

export const createAreaJourneysResponse = async (
  getAreaEvents: () => Promise<Vehicles[] | null>,
  minTime: Scalars['DateTime'],
  maxTime: Scalars['DateTime'],
  bbox: Scalars['PreciseBBox'],
  date: string,
  filters: AreaEventsFilterInput,
  unsignedEvents: boolean = true,
  user: AuthenticatedUser | null = null
): Promise<Journey[]> => {
  const fetchJourneys: CachedFetcher<Journey[]> = async () => {
    const areaEvents = await getAreaEvents()

    if (!areaEvents || areaEvents.length === 0) {
      return false
    }

    const validEvents = areaEvents.filter(
      (pos) => !!pos.lat && !!pos.long && !!pos.unique_vehicle_id
    )

    return map(
      groupBy(validEvents, (event) => {
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

  const journeys = await cacheFetch<Journey[]>(cacheKey, fetchJourneys, 24 * 60 * 60)

  if (!journeys || journeys.length === 0) {
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
