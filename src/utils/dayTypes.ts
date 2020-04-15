import getDay from 'date-fns/get_day'
import { ExceptionDay } from '../types/generated/schema-types'
import { isEqual, parse } from 'date-fns'

// If you are forking this for some other jurisdiction you probably want to edit here:
export const dayTypes = ['Ma', 'Ti', 'Ke', 'To', 'Pe', 'La', 'Su'] // day types as they are in JORE

// Wrong order because JS returns the day number in sunday-first order.
const dayTypesSundayFirst = ['Su', 'Ma', 'Ti', 'Ke', 'To', 'Pe', 'La']

export function getDayTypeFromDate(date: string | Date, exceptions?: ExceptionDay[]): string {
  const normalDayType = dayTypesSundayFirst[getDay(date)]

  if (!exceptions || exceptions.length === 0) {
    return normalDayType
  }

  const dateObj = typeof date === 'string' ? parse(date) : date

  const exceptionForDate = exceptions.find(
    (exception) =>
      (!exception.scope || exception.scope === 'all') &&
      isEqual(dateObj, parse(exception.exceptionDate))
  )

  if (exceptionForDate) {
    return exceptionForDate.dayType
  }

  return normalDayType
}
