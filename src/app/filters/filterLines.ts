import { Line as JoreLine } from '../../types/generated/jore-types'
import { get } from 'lodash'
import { LineFilterInput } from '../../types/generated/schema-types'
import { search } from './search'

export function filterLines(lines: JoreLine[], filter?: LineFilterInput) {
  const lineIdFilter = get(filter, 'lineId', '')
  const includeEmpty = get(filter, 'includeLinesWithoutRoutes', true)

  if (!lineIdFilter && includeEmpty) {
    return lines
  }

  let filteredLines = lines

  if (!includeEmpty) {
    filteredLines = lines.filter(
      (lineItem: JoreLine) => !(!includeEmpty && lineItem.routes.totalCount === 0)
    )
  }

  if (!lineIdFilter) {
    return filteredLines
  }

  const getSearchTermsForItem = ({ lineId, nameFi }: JoreLine) => [lineId, nameFi]
  return search<JoreLine>(filteredLines, lineIdFilter, getSearchTermsForItem)
}
