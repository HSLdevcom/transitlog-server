import { get } from 'lodash'
import { getDirection } from './getDirection'
import { Direction } from '../types/generated/schema-types'

interface HFPJourneyObject {
  oday?: string
  route_id?: string | null
  direction_id?: number
  journey_start_time?: string
}

interface JourneyObject {
  departureDate: string
  routeId: string
  direction: Direction
  departureTime: string
}

type Journey = HFPJourneyObject | JourneyObject

export const createJourneyId = (
  journeyObject: Journey | null = null,
  matchInstance = true
) => {
  const oday = get(journeyObject, 'oday', get(journeyObject, 'departureDate', null))
  const route_id = get(journeyObject, 'route_id', get(journeyObject, 'routeId', null))
  const journey_start_time = get(
    journeyObject,
    'journey_start_time',
    get(journeyObject, 'getDepartureTime', null)
  )
  const direction_id = getDirection(
    get(journeyObject, 'direction_id', get(journeyObject, 'direction', null))
  )

  let instance = getDirection(get(journeyObject, 'instance', 0))

  if (!route_id || !oday || !journey_start_time) {
    return ''
  }

  if (!matchInstance) {
    instance = 0
  }

  return `${oday}_${journey_start_time}_${route_id}_${direction_id}_${instance}`
}
