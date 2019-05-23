import { Alert } from '../types/generated/schema-types'
import { Moment } from 'moment'
import moment from 'moment-timezone'
import { TZ } from '../constants'
import { CachedFetcher } from '../types/CachedFetcher'
import { DBAlert } from '../types/EventsDb'
import { createAlert } from './objects/createAlert'
import { cacheFetch } from './cache'
import { sortBy } from 'lodash'

export type AlertSearchProps = {
  all?: boolean
  network?: boolean
  allRoutes?: boolean
  allStops?: boolean
  route?: string | string[]
  stop?: string | string[]
}

export const getAlerts = async (
  fetchAlerts: (dateTime: string, alertSearchProps: AlertSearchProps) => Promise<DBAlert[]>,
  dateTime: Moment | string,
  searchProps: AlertSearchProps = {}
): Promise<Alert[]> => {
  const time = moment.tz(dateTime, TZ).toISOString(true)

  const alertsFetcher: CachedFetcher<Alert[]> = async () => {
    const alerts = await fetchAlerts(time, searchProps)

    if (alerts.length === 0) {
      return false
    }

    return alerts.map((alert) => createAlert(alert))
  }

  const alertsCacheKey = `alerts_${time}_${sortBy(Object.entries(searchProps), ([key]) => key)
    .map(([key, value]) => `${key}:${value}`)
    .join('_')}`

  const alerts = await cacheFetch<Alert[]>(alertsCacheKey, alertsFetcher, 24 * 60 * 60)

  if (!alerts) {
    return []
  }

  return alerts
}
