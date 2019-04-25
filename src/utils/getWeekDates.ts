import { addDays, format, startOfISOWeek } from 'date-fns'

export const getWeekDates = (date) => {
  const weekStart = startOfISOWeek(date)
  const weekDates = [weekStart]

  while (weekDates.length < 7) {
    const nextDate = addDays(weekDates[weekDates.length - 1], 1)
    weekDates.push(nextDate)
  }

  return weekDates
}
