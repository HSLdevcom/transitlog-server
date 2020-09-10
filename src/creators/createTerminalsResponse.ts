import { RouteStop, Terminal } from '../types/generated/schema-types'
import { JoreRouteStop, JoreTerminal } from '../types/Jore'
import { cacheFetch } from '../cache'
import { CachedFetcher } from '../types/CachedFetcher'
import { createTerminalObject, TerminalStop } from '../objects/createTerminalObject'
import { compact, get, groupBy } from 'lodash'
import { validModes } from '../utils/validModes'
import { createStopResponse } from './createStopsResponse'
import pMap from 'p-map'

export async function createTerminalResponse(
  getTerminal: () => Promise<JoreTerminal[]>,
  getStops: (stopId: string) => Promise<JoreRouteStop[]>,
  terminalId: string,
  date: string,
  skipCache = false
) {
  const fetchTerminal: CachedFetcher<Terminal> = async () => {
    const fetchedTerminalStops = await getTerminal()

    if (!fetchedTerminalStops || fetchedTerminalStops.length === 0) {
      return false
    }

    const terminalStops: Array<RouteStop | null> = await pMap(
      fetchedTerminalStops,
      async (terminalStop) => {
        const stopId = terminalStop.stop_id || ''
        const stopResponse = await createStopResponse(
          () => getStops(stopId),
          date,
          stopId,
          skipCache
        )

        if (stopResponse) {
          stopResponse.id = 'terminal_' + stopResponse.id
        }

        return stopResponse
      }
    )

    const terminal = createTerminalObject(fetchedTerminalStops[0], compact(terminalStops))

    if (!terminal) {
      return false
    }

    return terminal
  }

  const cacheKey = `single_terminal_${terminalId}_${date}`
  const terminal = await cacheFetch<Terminal>(
    cacheKey,
    fetchTerminal,
    30 * 24 * 60 * 60,
    skipCache
  )

  if (!terminal) {
    return null
  }

  return terminal
}

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
          modes: validModes(terminalStop.modes),
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
