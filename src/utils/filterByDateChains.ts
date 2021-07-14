import { flatten } from 'lodash'
import { ValidityRange } from '../types/ValidityRange'
import { Dictionary } from '../types/Dictionary'
import { filterByDateGroups } from './filterByDateGroups'

// JORE objects have date_begin and date_end props that express a validity range.
export function filterByDateChains<ItemType extends ValidityRange>(
  groups: Dictionary<ItemType[]> | ItemType[][],
  date?: string
): ItemType[] {
  const validGroups: ItemType[][] = []

  for (let items of Object.values(groups)) {
    if (!items || items.length === 0) {
      continue
    }

    let validItems = !date ? items : filterByDateGroups(items, date)
    validGroups.push(validItems)
  }

  return flatten(validGroups)
}
