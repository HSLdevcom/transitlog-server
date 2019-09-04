import { Alert, AlertDistribution } from '../types/generated/schema-types'
import { Moment } from 'moment'
import moment from 'moment-timezone'
import { TZ } from '../constants'
import { CachedFetcher } from '../types/CachedFetcher'
import { DBAlert } from '../types/EventsDb'
import { createAlert } from './objects/createAlert'
import { cacheFetch } from './cache'

export type AlertSearchProps = {
  all?: boolean
  network?: boolean
  allRoutes?: boolean
  allStops?: boolean
  route?: string | string[]
  stop?: string | string[]
}

export const getAlerts = async (
  fetchAlerts: (dateTime: string) => Promise<DBAlert[]>,
  dateTime: Moment | string,
  language: string = 'fi',
  searchProps: AlertSearchProps = {}
): Promise<Alert[]> => {
  const time = moment.tz(dateTime, TZ).toISOString(true)

  const alertsFetcher: CachedFetcher<Alert[]> = async () => {
    const alerts = await fetchAlerts(time)

    if (alerts.length === 0) {
      return false
    }

    return alerts.map((alert) => createAlert(alert, language))
  }

  const alertsCacheKey = `alerts_${time}_${language}`
  const alerts = await cacheFetch<Alert[]>(alertsCacheKey, alertsFetcher, 24 * 60 * 60)

  if (!alerts) {
    return []
  }

  if (!searchProps || searchProps.all) {
    return alerts
  }

  return alerts.filter(({ distribution, affectedId }) => {
    let match = false

    if (searchProps.route) {
      match = distribution === AlertDistribution.Route && affectedId === searchProps.route
    }

    if (searchProps.stop) {
      match = distribution === AlertDistribution.Stop && affectedId === searchProps.stop
    }

    if (searchProps.allRoutes) {
      match = distribution === AlertDistribution.AllRoutes
    }

    if (searchProps.allStops) {
      match = distribution === AlertDistribution.AllStops
    }

    if (searchProps.network) {
      match = distribution === AlertDistribution.Network
    }

    return match
  })
}
