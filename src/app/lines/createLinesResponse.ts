import { groupBy } from 'lodash'
import { filterByDateChains } from '../../utils/filterByDateChains'
import { createLineObject } from './createLineObject'
import { Line as JoreLine } from '../../types/generated/jore-types'
import { Line, LineFilterInput } from '../../types/generated/schema-types'
import { cacheFetch } from '../cache'
import { filterLines } from './filterLines'

export async function createLinesResponse(
  getLines: () => Promise<JoreLine[]>,
  date?: string,
  filter?: LineFilterInput
): Promise<Line[]> {
  const fetchAndValidate = async () => {
    const lines = await getLines()
    const groupedLines = groupBy(lines, 'lineId')
    return filterByDateChains<JoreLine>(groupedLines, date)
  }

  const cacheKey = !date ? false : `lines_${date}`
  const validLines: JoreLine[] = await cacheFetch<JoreLine>(cacheKey, fetchAndValidate)

  const filteredLines = filterLines(validLines, filter)
  return filteredLines.map(createLineObject)
}
