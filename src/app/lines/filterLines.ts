import { Line as JoreLine } from '../../types/generated/jore-types'
import { get } from 'lodash'
import { LineFilterInput } from '../../types/generated/schema-types'

export function filterLines(lines: JoreLine[], filter?: LineFilterInput) {
  const lineIdFilter = get(filter, 'lineId', '')
  const includeEmpty = get(filter, 'includeLinesWithoutRoutes', true)

  if (!lineIdFilter || includeEmpty) {
    return lines
  }

  return lines.filter((lineItem: JoreLine) => {
    if (!includeEmpty && lineItem.routes.totalCount === 0) {
      return false
    }

    if (!lineIdFilter) {
      return true
    }

    return lineItem.lineId.includes(lineIdFilter)
  })
}
