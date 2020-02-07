import { JoreTerminal } from '../types/Jore'
import { Stop, Terminal } from '../types/generated/schema-types'
import { validModes } from '../utils/validModes'

export function createTerminalObject(terminal: JoreTerminal, stops: Stop[]): Terminal {
  const stopModes = validModes(...stops)
  console.log(stopModes)

  return {
    id: terminal.terminal_id,
    name: terminal.name_fi,
    lat: terminal.lat,
    lng: terminal.lon,
    stops,
    modes: stopModes,
  }
}
