import { Terminal } from '../types/generated/schema-types'
import { JoreTerminal } from '../types/Jore'
import { cacheFetch } from '../cache'
import { CachedFetcher } from '../types/CachedFetcher'
import { createTerminalObject, TerminalStop } from '../objects/createTerminalObject'
import { get, groupBy, compact } from 'lodash'
import { validModes } from '../utils/validModes'

export async function createTerminalsResponse(
  getTerminals: () => Promise<JoreTerminal[]>,
  date?: string,
  skipCache = false
): Promise<Terminal[]> {
  const fetchTerminals: CachedFetcher<Terminal[]> = async () => {
    const fetchedTerminals = await getTerminals()

    if (!fetchedTerminals || fetchedTerminals.length === 0) {
      return false
    }

    const terminalGroups: { [terminalId: string]: JoreTerminal[] } = groupBy(
      fetchedTerminals,
      'stop_terminal_id'
    )

    const terminals = Object.keys(terminalGroups).map((terminalId) => {
      const terminalItems: JoreTerminal[] = get(terminalGroups, terminalId, [])

      const terminalStops: TerminalStop[] = terminalItems.map(
        (terminalStop): TerminalStop => ({
          stopId: terminalStop.stop_id || '',
          modes: validModes(terminalStop),
        })
      )

      return createTerminalObject(terminalItems[0], terminalStops)
    })

    return compact(terminals)
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
