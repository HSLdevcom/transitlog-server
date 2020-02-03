// Wraps anything passed into an array. Falsy values result in an empty array.
export const arrVal = <T = any>(itemOrItems: T | T[]): T[] => {
  return !itemOrItems ? [] : Array.isArray(itemOrItems) ? itemOrItems : [itemOrItems]
}
