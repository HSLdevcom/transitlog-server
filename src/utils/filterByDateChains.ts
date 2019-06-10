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

      filtered.push(date ? filterByDate(items, date) : items)
      return filtered
    },
    []
  )

  return flatten(validGroups)
}
