import { reduce, orderBy, first, get, last, flatten } from 'lodash'
import { filterByDate } from './filterByDate'
import { ValidityRange } from '../types/ValidityRange'
import diffDays from 'date-fns/difference_in_days'
import { MAX_JORE_YEAR } from '../constants'
import { Dictionary } from '../types/Dictionary'

// JORE objects have dateBegin and dateEnd props that express a validity range.
// We have a problem where there can be multiple objects with overlapping
// validity ranges
export function filterByDateChains<ItemType extends ValidityRange>(
  groups: Dictionary<ItemType[]>,
  date?: string
): ItemType[] {
  const validGroups = reduce(
    groups,
    (filtered: ItemType[][], items: ItemType[]) => {
      // If it's only one item, we're good.
      if (items.length === 1) {
        filtered.push(date ? filterByDate(items, date) : items)
        return filtered
      }

      // Get the minimum dateBegin amongst the items
      const dateBeginOrdered = orderBy(items, 'dateBegin', 'asc')
      const minDate = get(first(dateBeginOrdered), 'dateBegin')

      // Order the items descending from the most distant dateEnd. This
      // is the array we'll pull items from and add to the chain.
      const dateEndOrdered = orderBy(items, 'dateEnd', 'desc')

      // Get the maximum date from amongst the items. The selected chain should
      // end with an item with this date.
      const maxDate = get(first(dateEndOrdered), 'dateEnd')

      // This function searches the ordered array to find the next link in the chain.
      // It checks the candidate's dateEnd if it is exactly a day off from item.
      // If it returns false, it did not find a result and item would end the chain.
      function findNextLink(item) {
        for (const candidate of dateEndOrdered) {
          const dayDiff = diffDays(
            // To get a positive number, put the date we presume to be LATER first.
            get(item, 'dateBegin', MAX_JORE_YEAR + '-12-31'),
            // and put the date we presume to be EARLIER second.
            get(candidate, 'dateEnd', MAX_JORE_YEAR + '-12-31')
          )

          // If the candidate's dateEnd is exactly one day before our item's dateBegin,
          // it is a valid link for the chain.
          if (dayDiff === 1) {
            return candidate
          }
        }

        // Returning false means that the item we passed into this
        // function is the last in the chain.
        return false
      }

      // Create a chain and use the item passed in as "startingPoint" to start it off.
      function createChain(startingPoint: ItemType): ItemType[] {
        const chain: ItemType[] = []

        // Keep track of the iteration so that we can kill the loop if it happens
        // to run off.
        let i = 0
        const maxIterations = 100

        // Until the chain ends with the minDate, run the loop. Extra precautions for runaway loops.
        while (get(last(chain), 'dateBegin') !== minDate || i > maxIterations) {
          let item

          if (chain.length === 0) {
            // Use the starting item to start it off. This would be the "last" item in the chain.
            item = startingPoint

            // If the chain wouldn't end with this link, or if its' dateBegin equals the minDate,
            // add it to the chain.
            if (findNextLink(item) || item.dateBegin === minDate) {
              chain.push(item)

              // If the dateBegin value is a valid minDate, we can end the chain right here.
              if (item.dateBegin === minDate) {
                break
              }
            }
          }

          // Continue off from the initial item or pick the last added item.
          item = item || last(chain)
          const nextItem = findNextLink(item)

          // If there isn't anything to add, I guess we're done...
          if (!nextItem) {
            break
          }

          // Make sure the item won't end the chain or is a valid end to the chain.
          if (findNextLink(nextItem) || nextItem.dateBegin === minDate) {
            chain.push(nextItem)
          }

          i++
        }

        // Since we went with the most distant endDate first, the chain is reversed.
        // The rest of the app, as well as the user, expects the items to be in ascending
        // chronological order so the chain just needs to be reversed.
        chain.reverse()
        return chain
      }

      // Find the valid endDates and use them to build competing chains.
      // If there is only one of the max endDates among the items
      // it won't be much of a competition.
      const chains = dateEndOrdered
        .filter(({ dateEnd }) => dateEnd === maxDate)
        .map(createChain)

      // Declare the winner of the chain competition. Longest chain wins.
      // TODO: We might want to include items from the leftover chains if they don't
      //  overlap with any items in the winning chain. But such cases are very rare.
      const longestChain: ItemType[] = orderBy(chains, 'length', 'desc')[0]
      // Get the item that is active for the selected date from the chain of valid items.
      filtered.push(date ? filterByDate(longestChain, date) : longestChain)

      return filtered
    },
    []
  )

  return flatten(validGroups)
}
