import { JoreExceptionDayDescription, JoreExceptionDay, JoreReplacementDay } from '../../types/Jore'
import { ExceptionDay } from '../../types/generated/schema-types'
import { get } from 'lodash'

function isReplacementDay(item: JoreExceptionDay | JoreReplacementDay): item is JoreReplacementDay {
  return (item as JoreReplacementDay).scope !== undefined
}

function isExceptionDay(item: JoreExceptionDay | JoreReplacementDay): item is JoreExceptionDay {
  return (item as JoreExceptionDay).exclusive !== undefined
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
  config: JoreReplacementDay | JoreExceptionDay | null,
  description?: JoreExceptionDayDescription | null
): ExceptionDay | null => {
  if (!config) {
    return null
  }

  return {
    id: `exception_day_${isReplacementDay(config) ? 'replacement' : 'exception'}_${
      config.day_type
    }_${config.date_in_effect}`,
    dayType: config.day_type,
    description: description ? get(description, 'description', '') : '',
    exceptionDate: config.date_in_effect,
    exclusive: isExceptionDay(config) ? config.exclusive === 1 : false,
    type: isExceptionDay(config) ? 'exception' : 'replacement',
    modeScope: isReplacementDay(config) ? getMode(config.scope) : '',
    newDayType: isExceptionDay(config) ? config.exception_day_type : config.replacing_day_type,
    startTime: isReplacementDay(config) ? config.time_begin : null,
    endTime: isReplacementDay(config) ? config.time_end : null,
  }
}
