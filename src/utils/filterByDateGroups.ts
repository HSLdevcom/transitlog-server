import { ValidityRange } from '../types/ValidityRange'
import { groupBy, orderBy } from 'lodash'
import moment from 'moment-timezone'
import { TZ } from '../constants'

export function filterByDateGroups<T extends ValidityRange>(items: T[], date: string): T[] {
  let groupedItems = groupBy<T>(items, (item: T) => `${item.date_begin}_${item.date_end}`)
  let hasModifiedDate = !!items[0]?.date_modified
  let validOnDate = moment.tz(date, TZ)

  let validGroupEntries = Object.entries<T[]>(groupedItems).filter(([validityRange]) => {
    let range = validityRange.split('_')
    let rangeStart = moment.tz(range[0], TZ)
    let rangeEnd = moment.tz(range[1], TZ)

    return validOnDate.isBetween(rangeStart, rangeEnd, 'day', '[]')
  })

  if (validGroupEntries.length === 0) {
    return []
  }

  if (validGroupEntries.length === 1) {
    return validGroupEntries[0][1]
  }

  let orderedGroups = orderBy(
    validGroupEntries,
    ([, items]) => {
      if (hasModifiedDate) {
        return moment(items[0].date_modified).unix()
      }

      return 0
    },
    'desc'
  )

  return orderedGroups[0][1] // Select the items from the first, ie most valid, group.
}
