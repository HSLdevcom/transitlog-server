import { words, orderBy } from 'lodash'

function escapeRegexCharacters(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function search<ItemType>(
  items: ItemType[],
  searchQuery: string,
  itemToSearchTerms: (ItemType) => string[]
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
  // Process the input query and split it into words.
  const queryValue = escapeRegexCharacters(searchQuery.trim().toLowerCase())
  const queryWords = words(queryValue, /[^\s]+/g)
    .filter((w) => !!w)
    .map((w) => w.toString())

  if (queryWords.length === 0) {
    return items
  }

  // The result item get a _matchScore property that can be queried for.
  type Match = { _matchScore?: number } & ItemType

  let filteredItems: Match[] = items

  // This is how valuable each word is in the match score. Each word is worth an equal
  // share of the base max score of 100. The score can go over 100 with bonuses.
  const wordValue = 100 / queryWords.length

  // Loop through the query words and match them against the items.
  for (const queryWord of queryWords) {
    // Since each word reduces the result set further, later words are given a bonus
    // since they are more "valuable" due to being matchable by less items.
    const queryWordIndex = queryWords.indexOf(queryWord)
    const queryWordValueWithBonus =
      queryWordIndex > 0 ? queryWordIndex * 1.5 * wordValue : wordValue

    // Filter the items and create a score for the current word.
    filteredItems = filteredItems.reduce((matches: Match[], item) => {
      // Get the array of terms to match against
      const searchTerms = itemToSearchTerms(item).map((term) =>
        term
          .toString()
          .replace(/\s|_/g, '')
          .toLowerCase()
      )
      const termsLength = searchTerms.join('').length

      if (termsLength === 0) {
        return matches
      }

      // This is the score that is given to the current query word.
      let queryWordScore = 0

      // Loop through the terms to match them
      for (const termWord of searchTerms) {
        // If the query is longer than the term, just move on (resulting in a score of 0).
        if (queryWord.length > termWord.length) {
          continue
        }

        // Calculate the value of the character should it match bwtween the query and the term.
        const charValue = queryWordValueWithBonus / queryWord.length

        // The character index of the term the matcher is looking at
        let termIndex = 0
        // The character index of the query word
        let queryIndex = 0
        // Multiple matches in a row results in a streak that gives a bonus to the score.
        let matchStreak = 0

        // Loop through each character in the query word.
        while (queryIndex < queryWord.length) {
          // Get the character to match in the term and the input character with separate
          // indices. This is because we want to increase these separately.
          const termChar = termWord[termIndex]
          const queryChar = queryWord[queryIndex]

          // If there is nothing to match, we might as well quit.
          if (typeof termChar === 'undefined') {
            break
          }

          // If the characters match...
          if (queryChar === termChar) {
            // Bonus comes from matching the first character of the query word, or if
            // the query and term character indices are equal.
            const bonus = queryIndex === 0 ? 1.5 : termIndex === queryIndex ? 1.1 : 1
            // A fourth of the character value is awarded multiplied by the streak.
            const streakBonus = matchStreak * (charValue / 4)

            // Apply the value and bonus to the word score.
            queryWordScore += charValue * bonus + streakBonus
            // The input index is increased ONLY if there is a match. This is so we don't need to
            // match the first character of the term.
            queryIndex++
            matchStreak++
          } else {
            // If the first character of the term didn't match the query, give a penalty
            // of one character value.
            if (termIndex === 0) {
              queryWordScore -= charValue
            }

            // Streaks are cut off as soon as the matches stop.
            matchStreak = 0
          }

          // The term character index is always increased.
          termIndex++
        }
      }

      // 30 is the threshold for an item being included in the result array. I found this
      // gives a sufficient amount of results for a search query of even one letter.
      if (queryWordScore > 30) {
        // @ts-ignore
        item._matchScore = (item._matchScore || 0) + queryWordScore
        matches.push(item)
      }

      return matches
    }, [])
  }

  // Finally, order the result by the score each item got.
  return orderBy(filteredItems, '_matchScore', 'desc')
}
