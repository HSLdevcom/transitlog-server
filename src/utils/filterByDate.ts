import { isWithinRange } from './isWithinRange'
import { ValidityRange } from '../types/ValidityRange'
import { orderBy, get } from 'lodash'
import moment from 'moment'

export function filterByDate<ItemType extends ValidityRange>(
  items: ItemType[],
  date: string
): ItemType[] {
  const validItems = items.filter((item) =>
    isWithinRange(date, item.date_begin, item.date_end)
  )

  if (validItems.length === 0) {
    return []
  }

  if (validItems.length === 1) {
    return validItems
  }

  let orderedItems: ItemType[] = validItems

  if (
    validItems.every((item) => !!get(item, 'date_modified', get(item, 'date_imported', false)))
  ) {
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
  } else {
    orderedItems = orderBy<ItemType>(validItems, ['date_begin', 'date_end'], ['desc', 'asc'])
  }

  return [orderedItems[0]]
}
