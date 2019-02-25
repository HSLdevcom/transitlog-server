import { groupBy } from 'lodash'
import { filterByDateChains } from '../../utils/filterByDateChains'
import { createLineObject } from './createLineObject'
import { Line as JoreLine } from '../../types/generated/jore-types'
import { Line } from '../../types/generated/schema-types'

export function createLinesResponse(lines: JoreLine[], date?: string): Line[] {
  const groupedLines = groupBy(lines, 'lineId')
  const validLines = filterByDateChains<JoreLine>(groupedLines, date)
  return validLines.map(createLineObject)
}
