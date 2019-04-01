import { Direction, Journey, Time } from '../types/generated/schema-types'
import { Vehicles } from '../types/generated/hfp-types'
import { CachedFetcher } from '../types/CachedFetcher'
import { cacheFetch } from './cache'
import { isToday } from 'date-fns'
import { Route as JoreRoute } from '../types/generated/jore-types'
import pMap from 'p-map'
import { createJourneyId } from '../utils/createJourneyId'
import { journeyInProgress } from '../utils/journeyInProgress'
import { getDirection } from '../utils/getDirection'
import { compact } from 'lodash'
import { createJourneyObject } from './objects/createJourneyObject'

export const createRouteJourneysResponse = async (
  getRoute: () => Promise<JoreRoute[] | null>,
  getJourneyList: () => Promise<Vehicles[] | null>,
  getJourney: (
    routeId: string,
    direction: Direction,
    departureTime: Time
  ) => Promise<Vehicles[] | null>,
  routeId: string,
  direction: Direction,
  date: string
): Promise<Journey[]> => {
  const fetchJourney: CachedFetcher<Vehicles[]> = async (
    journeyRouteId,
    journeyDirection,
    departureTime
  ) => {
    const journeyEvents = await getJourney(journeyRouteId, journeyDirection, departureTime)

    if (!journeyEvents || journeyEvents.length === 0) {
      return false
    }

    return journeyEvents
  }

  const fetchJourneyList: CachedFetcher<Vehicles[]> = async () => {
    const journeyIndex = await getJourneyList()

    if (!journeyIndex || journeyIndex.length === 0) {
      return false
    }

    return journeyIndex
  }

  const fetchAllJourneys: CachedFetcher<Journey[]> = async () => {
    const journeyListTTL: number = isToday(date) ? 5 * 60 : 24 * 60 * 60
    const journeyListKey = `journey_list_${routeId}_${direction}_${date}`
    const journeyList = await cacheFetch<Vehicles[]>(
      journeyListKey,
      fetchJourneyList,
      journeyListTTL
    )

    if (!journeyList) {
      return false
    }

    const fetchedJourneys: Array<Vehicles[] | null> = await pMap(journeyList, (journey) => {
      const journeyId = createJourneyId(journey)
      const journeyCacheKey = `journey_events_${journeyId}`

      return cacheFetch<Vehicles[]>(
        journeyCacheKey,
        () =>
          fetchJourney(
            journey.route_id,
            getDirection(journey.direction_id),
            journey.journey_start_time
          ),
        (data) => {
          if (journeyInProgress(data)) {
            return 2
          }

          return 5 * 60
        }
      )
    })

    const routeJourneys = compact<Vehicles[]>(fetchedJourneys)

    if (!routeJourneys || routeJourneys.length === 0) {
      return false
    }

    return routeJourneys.map((events) => createJourneyObject(events, null, [], null))
  }

  const journeysTTL: number = isToday(date) ? 60 : 24 * 60 * 60
  const journeysKey = `route_journeys_${routeId}_${direction}_${date}`
  const journeys = await cacheFetch<Journey[]>(journeysKey, fetchAllJourneys, journeysTTL)

  if (!journeys || journeys.length === 0) {
    return []
  }

  return journeys
}
