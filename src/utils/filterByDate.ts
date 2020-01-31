import { isWithinRange } from './isWithinRange'
import { ValidityRange } from '../types/ValidityRange'
import { orderBy } from 'lodash'
import moment from 'moment'

export function filterByDate<ItemType extends ValidityRange>(
  items: ItemType[],
  date: string
): ItemType[] {
  // Validate that each item is active during the selected date.
  const validItems = items.filter((item) =>
    isWithinRange(date, item.date_begin, item.date_end)
  )

  if (validItems.length === 0) {
    return []
  }

  if (validItems.length === 1) {
    return validItems
  }

  let orderedItems: ItemType[]

  // At this point all items are valid, but some items are more valid than others.
  // Order by the date_modified (if available) or date_imported column to find
  // the latest version in the collection.
  orderedItems = orderBy<ItemType>(
    validItems,
    (item) => {
      let date

      if (typeof item.date_modified !== 'undefined') {
        date = item.date_modified
      } else {
        date = item.date_imported
      }

      return moment(date).unix()
    },
    'desc'
  )

  // Return the first item which should be the most valid one.
  return [orderedItems[0]]
}
