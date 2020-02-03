import { Mode } from '../types/Jore'
import { arrVal } from './arrVal'
import { compact, flatten, uniq } from 'lodash'

export const validModes = (...modeArgs: any[]): Mode[] => {
  let allModes: any[] = modeArgs.map((modeArg: any) => {
    let val = modeArg

    if (!Array.isArray(modeArg) && typeof modeArg !== 'string') {
      let possibleModes: any[] = []

      if (typeof modeArg?.modes !== 'undefined') {
        possibleModes = [...possibleModes, ...arrVal<Mode>(modeArg?.modes)]
      }

      if (typeof modeArg?.mode !== 'undefined') {
        possibleModes.push(modeArg?.mode)
      }

      val = possibleModes
    }

    return arrVal<Mode>(val)
  })

  allModes = uniq(compact(flatten(allModes)))

  const validModes: Mode[] = allModes.map((mode) => {
    const formattedMode = (!mode || typeof mode !== 'string' ? 'BUS' : mode).toUpperCase()
    return (formattedMode === 'METRO' ? 'SUBWAY' : formattedMode) as Mode
  })

  return validModes.length !== 0 ? validModes : [Mode.Bus]
}
