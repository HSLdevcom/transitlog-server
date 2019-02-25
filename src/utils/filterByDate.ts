import { isWithinRange } from './isWithinRange'
import { ValidityRange } from '../types/ValidityRange'

export function filterByDate(items: ValidityRange[], date: string) {
  return items.filter((item) => {
    return isWithinRange(date, item.dateBegin, item.dateEnd)
  })
}
