import { isWithinRange } from './isWithinRange'
import { ValidityRange } from '../types/ValidityRange'
import { orderBy, first } from 'lodash'

export function filterByDate<ItemType extends ValidityRange>(
  items: ItemType[],
  date: string
): ItemType[] {
  const validItems = items.filter((item) => isWithinRange(date, item.date_begin, item.date_end))

  if (validItems.length === 1) {
    return validItems
  }

  const newestItem = first(
    orderBy<ItemType>(validItems, ['date_begin', 'date_end'], ['desc', 'desc'])
  )

  return newestItem ? [newestItem] : []
}
