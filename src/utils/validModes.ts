import { Mode } from '../types/Jore'
import { arrVal } from './arrVal'
import { compact, flatten, uniq } from 'lodash'

// The idea here is to throw in any number of whatevers and get out a list of unique
// Mode strings. It converts single values to arrays and extracts modes from passed objects.

type ObjWithMode = { mode?: string | Mode; modes?: string | Mode | Array<string | Mode> }
type ModeArg = Array<string | Mode | ObjWithMode> | string | Mode | ObjWithMode

function isObjWithMode(item): item is ObjWithMode {
  return typeof item?.modes !== 'undefined' || typeof item?.modes !== 'undefined'
}

export const validModes = (...modeArgs: ModeArg[]): Mode[] => {
  // Extract Mode values from each argument
  let allModes: any[] = modeArgs.map((modeArg: any) => {
    let val = modeArg

    // Check if we're dealing with an object with a .modes or .mode prop
    if (isObjWithMode(modeArg)) {
      let possibleModes: any[] = []

      // Slurp .modes if defined on the object
      if (typeof modeArg?.modes !== 'undefined') {
        possibleModes = [
          ...possibleModes,
          ...arrVal<Mode>(
            modeArg?.modes as Mode[],
            (modeItem) => typeof modeItem === 'string'
          ),
        ]
      }

      // Pick .mode if defined on the object
      if (typeof modeArg?.mode !== 'undefined') {
        possibleModes.push(modeArg?.mode)
      }

      val = possibleModes
    }

    // Ensure the val is an array.
    return arrVal<Mode>(val, (modeItem) => typeof modeItem === 'string')
  })

  allModes = uniq(compact(flatten(allModes)))

  // Convert mode to uppercase and METRO mode to SUBWAY
  const validModes: Mode[] = allModes.map((mode) => {
    const formattedMode = (!mode || typeof mode !== 'string' ? 'BUS' : mode).toUpperCase()
    return (formattedMode === 'METRO' ? 'SUBWAY' : formattedMode) as Mode
  })

  // Always return an array, use BUS if empty.
  return validModes.length !== 0 ? validModes : [Mode.Bus]
}
