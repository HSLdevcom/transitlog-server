import { groupBy } from 'lodash'
import { filterByDateChains } from '../../utils/filterByDateChains'
import { createLineObject } from './createLineObject'

export function createLinesResponse(lines, date?: string) {
  const groupedLines = groupBy(lines, 'lineId')
  const validLines = filterByDateChains(groupedLines, date)
  return validLines.map(createLineObject)
}
