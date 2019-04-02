import {
  ExceptionDay as ExceptionDayDescriptor,
  ExceptionDaysCalendar,
  ReplacementDaysCalendar,
} from '../../types/generated/jore-types'
import { ExceptionDay } from '../../types/generated/schema-types'
import { get } from 'lodash'

function isReplacementDay(
  item: ExceptionDaysCalendar | ReplacementDaysCalendar
): item is ReplacementDaysCalendar {
  return (item as ReplacementDaysCalendar).scope !== undefined
}

function isExceptionDay(
  item: ExceptionDaysCalendar | ReplacementDaysCalendar
): item is ExceptionDaysCalendar {
  return (item as ExceptionDaysCalendar).exclusive !== undefined
}

function getMode(code) {
  switch (code) {
    case '02':
      return 'TRAM'
    case '06':
      return 'SUBWAY'
    case '07':
      return 'FERRY'
    case '12':
      return 'RAIL'
    case '13':
      return 'RAIL'
    default:
      return 'BUS'
  }
}

export const createExceptionDayObject = (
  config: ReplacementDaysCalendar | ExceptionDaysCalendar | null,
  description?: ExceptionDayDescriptor | null
): ExceptionDay | null => {
  if (!config) {
    return null
  }

  return {
    id: `exception_day_${isReplacementDay(config) ? 'replacement' : 'exception'}_${
      config.dayType
    }_${config.dateInEffect}`,
    dayType: config.dayType,
    description: description ? get(description, 'description', '') : '',
    exceptionDate: config.dateInEffect,
    exclusive: isExceptionDay(config) ? config.exclusive === 1 : false,
    type: isExceptionDay(config) ? 'exception' : 'replacement',
    modeScope: isReplacementDay(config) ? getMode(config.scope) : '',
    newDayType: isExceptionDay(config) ? config.exceptionDayType : config.replacingDayType,
    startTime: isReplacementDay(config) ? config.timeBegin : null,
    endTime: isReplacementDay(config) ? config.timeEnd : null,
  }
}
