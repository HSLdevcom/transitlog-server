import getDay from 'date-fns/get_day'

// If you are forking this for some other jurisdiction you probably want to edit here:
const dayTypes = ['Su', 'Ma', 'Ti', 'Ke', 'To', 'Pe', 'La'] // day types as they are in JORE

export function getDayTypeFromDate(date: string | Date) {
  return dayTypes[getDay(date)]
}
