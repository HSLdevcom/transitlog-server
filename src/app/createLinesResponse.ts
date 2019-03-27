import { groupBy } from 'lodash'
import { filterByDateChains } from '../utils/filterByDateChains'
import { createLineObject } from './objects/createLineObject'
import { Line as JoreLine } from '../types/generated/jore-types'
import { Line, LineFilterInput } from '../types/generated/schema-types'
import { cacheFetch } from './cache'
import { filterLines } from './filters/filterLines'

export async function createLinesResponse(
  getLines: () => Promise<JoreLine[]>,
  date?: string,
  filter?: LineFilterInput
): Promise<Line[]> {
  const fetchAndValidate = async () => {
    const lines = await getLines()

    if (!lines) {
      return false
    }

    const groupedLines = groupBy(lines, 'lineId')
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
