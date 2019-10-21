import { Line } from '../types/generated/schema-types'
import { JoreLine } from '../types/Jore'

function createLineId(line: JoreLine): string {
  return `${line.line_id}_${line.date_begin}_${line.date_end}`
}

export function createLineObject(line: JoreLine): Line {
  return {
    id: createLineId(line),
    lineId: line.line_id,
    name: line.name_fi,
    // @ts-ignore
    _matchScore: line._matchScore,
  }
}
