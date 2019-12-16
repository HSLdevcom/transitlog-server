import { reduce, flatten } from 'lodash'
import { filterByDate } from './filterByDate'
import { ValidityRange } from '../types/ValidityRange'
import { Dictionary } from '../types/Dictionary'

// JORE objects have date_begin and date_end props that express a validity range.
export function filterByDateChains<ItemType extends ValidityRange>(
  groups: Dictionary<ItemType[]> | ItemType[][],
  date?: string
): ItemType[] {
  const validGroups = reduce(
    groups,
    (filtered: ItemType[][], items: ItemType[]) => {
      if (!items || items.length === 0) {
        return filtered
      }

      const withoutValidity = items.filter((item) => !item?.date_begin)

      // Just return if none of them have validity.
      if (items.length === withoutValidity.length) {
        return [...filtered, ...items]
      }

      filtered.push(date ? filterByDate(items, date) : items)
      return [...filtered, ...withoutValidity]
    },
    []
  )

  return flatten(validGroups)
}
