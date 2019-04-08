import { groupBy } from 'lodash'
import { filterByDateChains } from '../utils/filterByDateChains'
import { createLineObject } from './objects/createLineObject'
import { JoreLine } from '../types/Jore'
import { Line, LineFilterInput } from '../types/generated/schema-types'
import { cacheFetch } from './cache'
import { filterLines } from './filters/filterLines'
import { CachedFetcher } from '../types/CachedFetcher'

export async function createLinesResponse(
  getLines: () => Promise<JoreLine[]>,
  date?: string,
  filter?: LineFilterInput
): Promise<Line[]> {
  const fetchAndValidate: CachedFetcher<JoreLine[]> = async () => {
    const lines = await getLines()

    if (!lines || lines.length === 0) {
      return false
    }

    const groupedLines = groupBy(lines, 'line_id')
    return filterByDateChains<JoreLine>(groupedLines, date)
  }

  const cacheKey = !date ? false : `lines_${date}`
  const validLines = await cacheFetch<JoreLine[]>(cacheKey, fetchAndValidate, 24 * 60 * 60)

  if (!validLines) {
    return []
  }

  const filteredLines = filterLines(validLines, filter)
  return filteredLines.map(createLineObject)
}
