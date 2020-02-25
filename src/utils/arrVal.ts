import { compact } from 'lodash'

// Wraps anything passed into an array. Falsy values result in an empty array.
export const arrVal = <T = any>(
  itemOrItems: T | T[],
  filter: (val: T) => boolean = (val) => !!val
): T[] => {
  const arr = !itemOrItems ? [] : Array.isArray(itemOrItems) ? itemOrItems : [itemOrItems]
  return compact(arr).filter(filter)
}
