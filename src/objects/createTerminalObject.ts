import { JoreTerminal } from '../types/Jore'
import { RouteStop, Terminal } from '../types/generated/schema-types'
import { validModes } from '../utils/validModes'

type StopIdAndModes = {
  stopId: string
  modes: string[]
}

export type TerminalStop = StopIdAndModes | RouteStop

function isStop(item: any): item is RouteStop {
  return !!item && typeof item?.shortId !== 'undefined'
}

export function createTerminalObject(
  terminal: JoreTerminal,
  stops: TerminalStop[] = []
): Terminal | null {
  const stopModes = validModes(
    ...stops.map((stop) => (isStop(stop) ? stop.routes.map((r) => r.mode) : stop?.modes))
  )

  const lat = parseFloat(terminal.lat)
  const lon = parseFloat(terminal.lon)

  // Due to a import issue, the lon is truncated and missing the first character.
  const trueLng = lon < 20 ? lon + 20 : lon

  if (lat < 1 || lon < 1) {
    return null
  }

  const stopIds: string[] = stops.map((stop) => stop.stopId)

  return {
    id: terminal.terminal_id,
    name: terminal.name_fi,
    lat,
    lng: trueLng,
    stopIds: !stops || stops.length === 0 ? null : stopIds,
    stops: !stops || stops.length === 0 ? [] : stops.filter(isStop),
    modes: stopModes,
  }
}
