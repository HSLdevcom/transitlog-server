import { Terminal } from '../types/generated/schema-types'
import { JoreStop, JoreTerminal } from '../types/Jore'
import { cacheFetch } from '../cache'
import { CachedFetcher } from '../types/CachedFetcher'
import { fetchStops } from './createStopsResponse'
import { createTerminalObject } from '../objects/createTerminalObject'
import pMap from 'p-map'

export async function createTerminalsResponse(
  getTerminals: () => Promise<JoreTerminal[]>,
  getStops: (terminalId: string) => Promise<JoreStop[]>,
  date?: string,
  skipCache = false
): Promise<Terminal[]> {
  const fetchTerminals: CachedFetcher<Terminal[]> = async () => {
    const fetchedTerminals = await getTerminals()

    if (!fetchedTerminals || fetchedTerminals.length === 0) {
      return false
    }

    return pMap(
      fetchedTerminals,
      async (terminal) => {
        let terminalStops = await fetchStops(() => getStops(terminal.terminal_id))
        terminalStops = terminalStops || []

        return createTerminalObject(terminal, terminalStops)
      },
      { concurrency: 5 }
    )
  }

  const cacheKey = `terminals_${date}`
  const terminals = await cacheFetch<Terminal[]>(
    cacheKey,
    fetchTerminals,
    30 * 24 * 60 * 60,
    skipCache
  )

  if (!terminals) {
    return []
  }

  return terminals
}
