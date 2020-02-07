import { JoreTerminal } from '../types/Jore'
import { Terminal } from '../types/generated/schema-types'
import { validModes } from '../utils/validModes'

export type TerminalStop = {
  stopId: string
  modes: string[]
}

export function createTerminalObject(terminal: JoreTerminal, stops: TerminalStop[]): Terminal {
  const stopModes = validModes(...stops)

  return {
    id: terminal.terminal_id,
    name: terminal.name_fi,
    lat: terminal.lat,
    lng: terminal.lon,
    stops: stops.map((stop) => stop.stopId),
    modes: stopModes,
  }
}
