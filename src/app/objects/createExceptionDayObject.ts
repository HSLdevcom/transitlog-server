import { JoreExceptionDay } from '../../types/Jore'
import { ExceptionDay } from '../../types/generated/schema-types'
import { getMode } from '../../utils/getMode'
import { compact } from 'lodash'

export const createExceptionDayObject = (config: JoreExceptionDay | null): ExceptionDay | null => {
  if (!config) {
    return null
  }

  return {
    id: `exception_day_${config.day_type}_${config.date_in_effect}`,
    dayType: config.day_type,
    description: config.description || '',
    exceptionDate: config.date_in_effect,
    exclusive: config.exclusive === 1 || false,
    modeScope: getMode(config.scope) || '',
    effectiveDayTypes: compact(config.effective_day_types),
    startTime: config.time_begin || null,
    endTime: config.time_end || null,
  }
}
