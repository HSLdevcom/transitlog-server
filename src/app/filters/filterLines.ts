import { JoreLine } from '../../types/Jore'
import { get } from 'lodash'
import { LineFilterInput } from '../../types/generated/schema-types'
import { search } from './search'

export function filterLines(lines: JoreLine[], filter?: LineFilterInput) {
  const lineSearchFilter = get(filter, 'search', '')

  if (!lineSearchFilter) {
    return lines
  }

  const filteredLines = lines

  if (!lineSearchFilter) {
    return filteredLines
  }

  const getSearchTermsForItem = ({ line_id, name_fi }: JoreLine) => [line_id, name_fi]
  return search<JoreLine>(filteredLines, lineSearchFilter, getSearchTermsForItem)
}
