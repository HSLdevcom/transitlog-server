import { ValidityRange } from '../types/ValidityRange'
import { groupBy, orderBy } from 'lodash'
import moment from 'moment-timezone'
import { TZ } from '../constants'

type ValidityRangeWithImport = ValidityRange & {
  date_imported?: string
}

export function filterByDateGroups<T extends ValidityRangeWithImport>(
  items: T[],
  date: string
): T[] {
  const groupedItems = groupBy(items, (item) => `${item.date_begin}_${item.date_end}`)
  const validOnDate = moment.tz(date, TZ)

  const validGroupEntries = Object.entries(groupedItems).filter(([validityRange]) => {
    const [start, end] = validityRange.split('_')
    const rangeStart = moment.tz(start, TZ)
    const rangeEnd = moment.tz(end, TZ)

    return validOnDate.isBetween(rangeStart, rangeEnd, 'day', '[]')
  })

  if (validGroupEntries.length === 0) {
    return []
  }

  // validGroupEntries[0][0] = the group key
  // validGroupEntries[0][1] = the items

  if (validGroupEntries.length === 1) {
    return validGroupEntries[0][1]
  }

  const getLatestAllowedImportUnix = (groupItems: T[]) => {
    const allowedImports = groupItems
      .map((item) => item.date_imported)
      .filter((d): d is string => !!d)
      .map((d) => moment.tz(d, TZ))
      .filter((importDate) => importDate.isSameOrBefore(validOnDate, 'day'))

    if (allowedImports.length === 0) {
      return null
    }

    return Math.max(...allowedImports.map((d) => d.unix()))
  }

  const hasAnyAllowedImports = validGroupEntries.some(([, groupItems]) => {
    return getLatestAllowedImportUnix(groupItems) !== null
  })

  const orderedGroups = orderBy(
    validGroupEntries,
    hasAnyAllowedImports
      ? [
          // First order by the latest allowed date_imported, so that groups with more recent imports that are still valid on the UI date come first.
          ([, groupItems]) => getLatestAllowedImportUnix(groupItems) ?? 0,
          // If there are multiple groups with the same latest allowed import date order those groups by date_begin.
          ([, groupItems]) => moment.tz(groupItems[0].date_begin, TZ).unix(),
        ]
      : [
          // If there are no allowed date_importeds just order by date_begin.
          ([, groupItems]) => moment.tz(groupItems[0].date_begin, TZ).unix(),
        ],
    hasAnyAllowedImports ? ['desc', 'desc'] : ['desc']
  )

  return orderedGroups[0][1] // Select the items from the first, ie most valid, group.
}
