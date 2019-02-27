import { words, orderBy } from 'lodash'

function escapeRegexCharacters(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function search<ItemType>(
  items: ItemType[],
  searchTerm: string,
  itemToSearchTerms: (ItemType) => string[]
): ItemType[] {
  const inputValue = escapeRegexCharacters(searchTerm.trim().toLowerCase())
  const inputWords = words(inputValue, /[^\s]+/g)
    .filter((w) => !!w)
    .map((w) => w.toString().replace(/\+/g, ''))

  if (inputWords.length === 0) {
    return items
  }

  type Match = { score: number; item: ItemType }

  const filteredItems: Match[] = items.reduce((results: Match[], item) => {
    const itemTerms = itemToSearchTerms(item).map((term) =>
      term
        .toString()
        .replace(/\s|_/gi, '')
        .toLowerCase()
    )
    const itemTermsLength = itemTerms.join('').length

    if (itemTermsLength === 0) {
      return results
    }

    let matchScore = 0

    for (const word of itemTerms) {
      const inputPointsAvailable = 100 / word.length

      for (const inputWord of inputWords) {
        const charValue =
          inputWord.length < word.length ? inputPointsAvailable : 100 / inputWord.length

        let wordScore = 0
        let matchIndex = 0
        let inputIndex = 0

        while (inputIndex < inputWord.length) {
          const matchChar = word[matchIndex]
          const inputChar = inputWord[inputIndex]

          if (typeof matchChar === 'undefined') {
            break
          }

          if (inputChar === matchChar) {
            wordScore += charValue
            inputIndex++
          } else {
            wordScore = 0
          }

          matchIndex++
        }

        matchScore += wordScore
      }
    }

    if (matchScore > 0) {
      results.push({ score: matchScore, item })
    }

    return results
  }, [])

  return orderBy(filteredItems, 'score', 'desc').map(({ score, item }) => {
    // @ts-ignore
    item._matchScore = score
    return item
  })
}
