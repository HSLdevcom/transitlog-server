import { JoreTerminal } from '../types/Jore'
import { Terminal } from '../types/generated/schema-types'
import { validModes } from '../utils/validModes'

export type TerminalStop = {
  stopId: string
  modes: string[]
}

export function createTerminalObject(
  terminal: JoreTerminal,
  stops: TerminalStop[]
): Terminal | null {
  const stopModes = validModes(...stops)

  const lat = parseFloat(terminal.lat)
  const lon = parseFloat(terminal.lon)

  // Due to a import issue, the lon is truncated and missing the first character.
  const trueLng = lon < 20 ? lon + 20 : lon

  if (lat < 1 || lon < 1) {
    return null
  }

  return {
    id: terminal.terminal_id,
    name: terminal.name_fi,
    lat,
    lng: trueLng,
    stops: stops.map((stop) => stop.stopId),
    modes: stopModes,
  }
}
