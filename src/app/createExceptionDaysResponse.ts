import { CachedFetcher } from '../types/CachedFetcher'
import { ExceptionDay } from '../types/generated/schema-types'
import {
  ExceptionDay as ExceptionDayDescriptor,
  ExceptionDaysCalendar,
  ReplacementDaysCalendar,
  ExceptionDaysCalendarsConnection,
  ExceptionDaysConnection,
  ReplacementDaysCalendarsConnection,
} from '../types/generated/jore-types'
import { isSameYear } from 'date-fns'
import { cacheFetch } from './cache'
import { get, orderBy, compact } from 'lodash'
import { createExceptionDayObject } from './objects/createExceptionDayObject'

type JoreExceptionQueryResponse = {
  exceptionDayIndex: ExceptionDaysConnection
  exceptionDays: ExceptionDaysCalendarsConnection
  replacementDays: ReplacementDaysCalendarsConnection
}

export const createExceptionDaysResponse = async (
  getExceptionData: () => Promise<JoreExceptionQueryResponse>,
  year
) => {
  const fetchData: CachedFetcher<ExceptionDay[]> = async () => {
    const exceptionData = await getExceptionData()

    if (!exceptionData) {
      return false
    }

    const {
      exceptionDayIndex: { nodes: exceptionDayDescriptionNodes },
      exceptionDays: { nodes: exceptionDayNodes },
      replacementDays: { nodes: replacementDayNodes },
    } = exceptionData

    const exceptionDayIndex: ExceptionDayDescriptor[] = compact(exceptionDayDescriptionNodes || [])
    const joreExceptionDays: ExceptionDaysCalendar[] = compact(exceptionDayNodes || [])
    const joreReplacementDays: ReplacementDaysCalendar[] = compact(replacementDayNodes || [])

    const exceptionDayObjects = joreExceptionDays.reduce((days: ExceptionDay[], day) => {
      const description = exceptionDayIndex.find(
        (dayDescriptor) =>
          get(dayDescriptor, 'exceptionDayType', '') === get(day, 'exceptionDayType', null)
      )

      const dayObject = createExceptionDayObject(day, description)

      if (dayObject) {
        days.push(dayObject)
      }

      return days
    }, [])

    const replacementDayObjects = joreReplacementDays.reduce((days: ExceptionDay[], day) => {
      const dayObject = createExceptionDayObject(day)

      if (dayObject) {
        days.push(dayObject)
      }

      return days
    }, [])

    const combinedDays = orderBy(exceptionDayObjects.concat(replacementDayObjects), 'exceptionDate')
    return combinedDays.filter((day) => isSameYear(day.exceptionDate, year))
  }

  const cacheKey = `exception_days_${year}`
  const exceptionDays = await cacheFetch<ExceptionDay[]>(cacheKey, fetchData, 1)

  if (!exceptionDays) {
    return []
  }

  return exceptionDays
}
