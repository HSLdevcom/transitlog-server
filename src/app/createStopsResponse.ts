import { StopFilterInput, Stop } from '../types/generated/schema-types'
import { Stop as JoreStop } from '../types/generated/jore-types'
import { cacheFetch } from './cache'
import { createStopObject } from './objects/createStopObject'
import { filterStopsByBBox } from './filters/filterStopsByBBox'
import { search } from './filters/search'

function getSearchValue(item) {
  const { stopId = '', shortId = '', nameFi = '' } = item
  return stopId ? [stopId, shortId.replace(/\s/g, ''), nameFi] : []
}

export async function createStopsResponse(
  getStops: () => Promise<JoreStop[]>,
  filter?: StopFilterInput
): Promise<Stop[]> {
  const cacheKey = `stops`
  const stops: JoreStop[] = await cacheFetch(cacheKey, getStops, 86400)

  let filteredStops = stops

  if (filter) {
    filteredStops = []

    if (filter.bbox) {
      filteredStops = filterStopsByBBox(stops, filter.bbox)
    } else if (filter.search) {
      filteredStops = search<JoreStop>(stops, filter.search, getSearchValue)
    }
  }

  return filteredStops.map(createStopObject)
}
