import { Line } from '../../types/generated/schema-types'
import { Line as JoreLine } from '../../types/generated/jore-types'

function createLineId(line: JoreLine): string {
  return `${line.lineId}_${line.dateBegin}_${line.dateEnd}`
}

export function createLineObject(line: JoreLine): Line {
  return {
    id: createLineId(line),
    lineId: line.lineId,
    name: line.nameFi,
  }
}
