import { StopFilterInput, Stop } from '../types/generated/schema-types'
import { Stop as JoreStop } from '../types/generated/jore-types'
import { cacheFetch } from './cache'
import { createStopObject } from './objects/createStopObject'

export async function createStopsResponse(
  getStops: () => Promise<JoreStop[]>,
  filter?: StopFilterInput
): Promise<Stop[]> {
  const cacheKey = `stops`
  const stops: JoreStop[] = await cacheFetch(cacheKey, getStops, 86400)

  // TODO: Add search and bbox filter

  return stops.map(createStopObject)
}
