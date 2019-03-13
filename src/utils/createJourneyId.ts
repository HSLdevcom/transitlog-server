import { get } from 'lodash'
import { getDirection } from './getDirection'
import { Direction } from '../types/generated/schema-types'

interface HFPJourneyObject {
  oday?: string
  route_id?: string | null
  direction_id?: number
  journey_start_time?: string
  instance?: number
}

interface JourneyObject {
  departureDate: string
  routeId: string
  direction: Direction
  departureTime: string
  instance?: number
}

type Journey = HFPJourneyObject | JourneyObject

export const createJourneyId = (journeyObject: Journey | null = null, instance = 0) => {
  const oday = get(journeyObject, 'oday', get(journeyObject, 'departureDate', null))
  const route_id = get(journeyObject, 'route_id', get(journeyObject, 'routeId', null))
  const journey_start_time = get(
    journeyObject,
    'journey_start_time',
    get(journeyObject, 'departureTime', null)
  )
  const direction_id = getDirection(
    get(journeyObject, 'direction_id', get(journeyObject, 'direction', null))
  )

  let journeyInstance = getDirection(get(journeyObject, 'instance', instance))

  if (!route_id || !oday || !journey_start_time) {
    return ''
  }

  if (!instance) {
    journeyInstance = 0
  }

  return `${oday}_${journey_start_time}_${route_id}_${direction_id}_${journeyInstance}`
}
