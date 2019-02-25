import { groupBy } from 'lodash'
import { filterByDateChains } from '../../utils/filterByDateChains'
import { createLineObject } from './createLineObject'
import { Line as JoreLine } from '../../types/generated/jore-types'
import { Line, LineFilterInput } from '../../types/generated/schema-types'
import { getItem, hasItem, setItem } from '../cache'
import { filterLines } from './filterLines'

export async function createLinesResponse(
  lines: JoreLine[],
  date?: string,
  filter?: LineFilterInput
): Promise<Line[]> {
  const cacheKey = `lines_${date}`
  let validLines: JoreLine[] = []

  if (date && (await hasItem(cacheKey))) {
    validLines = (await getItem<JoreLine>(cacheKey)) || []
  }

  if (validLines.length === 0) {
    const groupedLines = groupBy(lines, 'lineId')
    validLines = filterByDateChains<JoreLine>(groupedLines, date)

    if (date) {
      await setItem(cacheKey, validLines)
    }
  }

  const filteredLines = filterLines(validLines, filter)
  return filteredLines.map(createLineObject)
}
