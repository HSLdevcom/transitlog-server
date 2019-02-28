import { Line as JoreLine } from '../../types/generated/jore-types'
import { get } from 'lodash'
import { LineFilterInput } from '../../types/generated/schema-types'
import { search } from './search'

export function filterLines(lines: JoreLine[], filter?: LineFilterInput) {
  const lineSearchFilter = get(filter, 'search', '')
  const includeEmpty = get(filter, 'includeLinesWithoutRoutes', true)

  if (!lineSearchFilter && includeEmpty) {
    return lines
  }

  let filteredLines = lines

  if (!includeEmpty) {
    filteredLines = lines.filter(
      (lineItem: JoreLine) => !(!includeEmpty && lineItem.routes.totalCount === 0)
    )
  }

  if (!lineSearchFilter) {
    return filteredLines
  }

  const getSearchTermsForItem = ({ lineId, nameFi }: JoreLine) => [lineId, nameFi]
  return search<JoreLine>(filteredLines, lineSearchFilter, getSearchTermsForItem)
}
