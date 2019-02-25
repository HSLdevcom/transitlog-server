import { isWithinRange } from './isWithinRange'
import { ValidityRange } from '../types/ValidityRange'

export function filterByDate<ItemType extends ValidityRange>(
  items: ItemType[],
  date: string
): ItemType[] {
  return items.filter((item) => {
    return isWithinRange(date, item.dateBegin, item.dateEnd)
  })
}
