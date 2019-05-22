import { words } from 'lodash'
import Fuse from 'fuse.js'

function escapeRegexCharacters(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function search<ItemType>(
  items: ItemType[],
  query: string,
  keys: string[] | Array<{ name: string; weight: number }>
): ItemType[] {
  /**
   * This function searches the array `items` for items that match the search query.
   * The search query is split into words, and each item gets an array of terms created
   * for it through the `itemToSearchTerms` function. The query words are matched against
   * the item terms and a score is given based on how well they match. Each query word is
   * matched against the result set of the previous word, meaning all words have to
   * match the items that end up in the final result array. The result is then ordered
   * by match score so that the best matching item is first in the array.
   */
  // Clean the input query
  const queryValue = escapeRegexCharacters(query.trim().toLowerCase())

  if (!queryValue) {
    return items
  }

  const queryWords = words(queryValue, /[^,\s?]+/g) // Split the query into words on commas
    .map((w) => w.toString().replace(/\s|_/g, '')) // Apply whitespace filter
    .filter((w) => !!w) // Only truthy words

  // No query, no filtering.
  if (queryWords.length === 0) {
    return items
  }

  const queryString = queryWords.join(' ')

  // Find matching items from the filtered set.
  const fuse = new Fuse(items, {
    keys,
  })

  // Finally, order the result by the score each item got.
  return fuse.search(queryString)
}
