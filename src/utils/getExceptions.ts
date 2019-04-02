import { ExceptionDataSource } from '../datasources/ExceptionDataSource'
import { CachedFetcher } from '../types/CachedFetcher'
import { ExceptionDay } from '../types/generated/schema-types'
import { JoreExceptionDayDescription, JoreExceptionDay, JoreReplacementDay } from '../types/Jore'
import { createExceptionDayObject } from '../app/objects/createExceptionDayObject'
import { isSameYear } from 'date-fns'
import { cacheFetch } from '../app/cache'
import { compact, get, orderBy } from 'lodash'

let dataSource: null | ExceptionDataSource = null

const fetchExceptions: CachedFetcher<ExceptionDay[]> = async (year) => {
  if (!dataSource) {
    dataSource = new ExceptionDataSource()
  }

  const exceptionData = await dataSource.getExceptionDaysForYear(year)

  if (!exceptionData) {
    return false
  }

  const {
    exceptionDayIndex: { nodes: exceptionDayDescriptionNodes },
    exceptionDays: { nodes: exceptionDayNodes },
    replacementDays: { nodes: replacementDayNodes },
  } = exceptionData

  const exceptionDayIndex: JoreExceptionDayDescription[] = compact(
    exceptionDayDescriptionNodes || []
  )
  const joreExceptionDays: JoreExceptionDay[] = compact(exceptionDayNodes || [])
  const joreReplacementDays: JoreReplacementDay[] = compact(replacementDayNodes || [])

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

export const getExceptions = async (year) => {
  const cacheKey = `exception_days_${year}`
  const exceptionDays = await cacheFetch<ExceptionDay[]>(
    cacheKey,
    () => fetchExceptions(year),
    30 * 24 * 60 * 60
  )

  if (!exceptionDays) {
    return []
  }

  return exceptionDays
}

export const getExceptionForDate = async (date: Date) => {}
