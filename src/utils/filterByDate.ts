import { isWithinRange } from './isWithinRange'
import { ValidityRange } from '../types/ValidityRange'
import { orderBy } from 'lodash'

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

  let orderedItems = validItems

  if (validItems.every(({ date_modified }) => !!date_modified)) {
    orderedItems = orderBy<ItemType>(validItems, 'date_modified', 'desc')
  } else {
    orderedItems = orderBy<ItemType>(validItems, ['date_begin', 'date_end'], ['desc', 'asc'])
  }

  return [orderedItems[0]]
}
