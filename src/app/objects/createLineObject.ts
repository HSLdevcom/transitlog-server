import { Line } from '../../types/generated/schema-types'
import { Line as JoreLine } from '../../types/generated/jore-types'
import get from 'lodash/get'

function createLineId(line: JoreLine): string {
  return `${line.lineId}_${line.dateBegin}_${line.dateEnd}`
}

export function createLineObject(line: JoreLine): Line {
  return {
    id: createLineId(line),
    lineId: line.lineId,
    name: line.nameFi,
    routesCount: get(line, 'routes.totalCount', 0),
    // @ts-ignore
    _matchScore: line._matchScore,
  }
}
