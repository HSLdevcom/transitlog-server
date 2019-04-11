import { reduce, orderBy, first, get, last, flatten } from 'lodash'
import { filterByDate } from './filterByDate'
import { ValidityRange } from '../types/ValidityRange'
import diffHours from 'date-fns/difference_in_hours'
import { MAX_JORE_YEAR } from '../constants'
import { Dictionary } from '../types/Dictionary'
import diffDays from 'date-fns/difference_in_days'

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

      // If it's only one item, we're good.
      if (items.length === 1) {
        filtered.push(date ? filterByDate(items, date) : items)
        return filtered
      }

      // Get the minimum date_begin amongst the items
      const dateBeginOrdered = orderBy(items, 'date_begin', 'asc')
      const minDate = get(first(dateBeginOrdered), 'date_begin')

      // Order the items descending from the most distant date_end. This
      // is the array we'll pull items from and add to the chain.
      const dateEndOrdered = orderBy(items, 'date_end', 'desc')

      // This function searches the ordered array to find the next link in the chain.
      // It checks the candidate's date_end if it is exactly a day off from item.
      // If it returns false, it did not find a result and item would end the chain.
      function findNextLink(item) {
        if (!item) {
          return false
        }

        for (const candidate of dateEndOrdered) {
          const hoursDiff = diffHours(
            // To get a positive number, put the date we presume to be LATER first.
            get(item, 'date_begin', MAX_JORE_YEAR + '-12-31'),
            // and put the date we presume to be EARLIER second.
            get(candidate, 'date_end', MAX_JORE_YEAR + '-12-31')
          )

          // If the candidate's date_end is roughly one day before our item's date_begin,
          // it is a valid link for the chain. Need to use hours because of DST.
          if (hoursDiff > 22 && hoursDiff < 26) {
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

        if (!startingPoint) {
          return chain
        }

        // Keep track of the iteration so that we can
        // kill the loop if it happens to run off.
        let i = 0
        const maxIterations = 100

        // Extra precautions for runaway loops.
        while (get(last(chain), 'date_begin') !== minDate && i < maxIterations) {
          if (chain.length === 0) {
            // Use the starting item to start it off. This would be the "last" item in the chain.
            chain.push(startingPoint)
          }

          // Pick the last added item.
          const item = last(chain)
          const nextItem = findNextLink(item)

          // If there isn't anything to add, I guess we're done...
          if (!nextItem) {
            break
          }

          chain.push(nextItem)
          i++
        }

        // Since we went with the most distant endDate first, the chain is reversed.
        // The rest of the app, as well as the user, expects the items to be in ascending
        // chronological order so the chain just needs to be reversed.
        chain.reverse()
        return chain
      }

      // Build competing chains starting from each item.
      const chains = dateEndOrdered.map(createChain)

      // The lack of chains is not very useful, so bail here in that case.
      if (chains.length === 0) {
        return filtered
      }

      const lengthOrdered = orderBy(chains, 'length', 'desc')
      // Declare the winner of the chain competition. Longest chain wins.
      const longestChain = lengthOrdered[0]
      const longestLength = longestChain.length

      // Empty chains are not very useful, so bail here in that case.
      if (longestLength === 0) {
        return filtered
      }

      // There may be multiple chains with the same length. They all share the first
      // prize, but we still need to declare an actual winner.
      let winningChains = lengthOrdered.filter((chain) => chain.length === longestLength)

      // Default to the first one. If there is only one longest chain, it will be used.
      let winningChain = winningChains[0]

      // In the case of many longest chains, further logic is needed. This means
      // that items have probably been deleted and modified in JORE, like for
      // exceptions that are in effect for a shorter time. Thus we want the
      // chain that has the least amount of days between its items.
      if (winningChains.length > 1) {
        // First make sure that the chains actually have a valid item
        if (date) {
          winningChains = winningChains.filter((chain) => filterByDate(chain, date).length !== 0)
        }

        if (winningChains.length > 0) {
          // Pick the chain with the least amount of days when where are many
          // with the same length. The logic is that this should result in a
          // "tighter fit" around the current date.
          winningChain = orderBy(
            winningChains,
            (chain) => {
              let days = 0

              for (const item of chain) {
                days += diffDays(item.date_end, item.date_begin)
              }

              return days
            },
            'asc'
          )[0] // The shortest-by-days chain is first
        }
      }
      // Get the item that is active for the selected date from the chain of valid items.
      filtered.push(date ? filterByDate(winningChain, date) : longestChain)
      return filtered
    },
    []
  )

  return flatten(validGroups)
}
