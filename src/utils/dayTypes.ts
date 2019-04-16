import getDay from 'date-fns/get_day'

// If you are forking this for some other jurisdiction you probably want to edit here:
export const dayTypes = ['Ma', 'Ti', 'Ke', 'To', 'Pe', 'La', 'Su'] // day types as they are in JORE

// Wrong order because JS returns the day number in sunday-first order.
const dayTypesWrongOrder = ['Su', 'Ma', 'Ti', 'Ke', 'To', 'Pe', 'La']

export function getDayTypeFromDate(date: string | Date) {
  return dayTypesWrongOrder[getDay(date)]
}
