import { reduce, flatten } from 'lodash'
import { filterByDate } from './filterByDate'
import { ValidityRange } from '../types/ValidityRange'
import { Dictionary } from '../types/Dictionary'

// JORE objects have date_begin and date_end props that express a validity range.
// We have a problem where there can be multiple objects with overlapping
// validity ranges, so to figure out which ones are the valid ones we construct
// "validity chains". The objects that don't fit in the chain are invalid.
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
