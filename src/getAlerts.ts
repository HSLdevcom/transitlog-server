import { Alert, AlertDistribution } from './types/generated/schema-types'
import { Moment } from 'moment'
import moment from 'moment-timezone'
import { TZ } from './constants'
import { CachedFetcher } from './types/CachedFetcher'
import { DBAlert } from './types/EventsDb'
import { createAlert } from './objects/createAlert'
import { cacheFetch } from './cache'
import { isToday } from 'date-fns'
import { uniqBy } from 'lodash'

export type AlertSearchProps = {
  all?: boolean
  network?: boolean
  allRoutes?: boolean
  allStops?: boolean
  route?: string | string[] | boolean
  stop?: string | string[] | boolean
}

export const getAlerts = async (
  fetchAlerts: (startDate: string, endDate: string) => Promise<DBAlert[]>,
  dateTime: Moment | string,
  searchProps: AlertSearchProps = {},
  language: string = 'fi',
  skipCache: boolean = false
): Promise<Alert[]> => {
  const startTimeMoment = moment.tz(dateTime, TZ).startOf('day')
  const endTimeMoment = moment
    .tz(startTimeMoment, TZ)
    .endOf('day')
    .add(4.5, 'hours')

  const alertsFetcher: CachedFetcher<Alert[]> = async () => {
    const alerts = await fetchAlerts(
      startTimeMoment.toISOString(true),
      endTimeMoment.toISOString(true)
    )

    if (alerts.length === 0) {
      return false
    }

    return alerts.map((alert) => createAlert(alert, language))
  }

  const alertsCacheKey = `alerts_${startTimeMoment.format('YYYY-MM-DD')}_${language}`
  const dateIsToday = isToday(startTimeMoment.toDate())
  const alerts = await cacheFetch<Alert[]>(
    alertsCacheKey,
    alertsFetcher,
    dateIsToday ? 5 * 60 : 24 * 60 * 60,
    skipCache
  )

  if (!alerts) {
    return []
  }

  const mergedAlerts: Alert[] = uniqBy(
    alerts,
    ({ level, distribution, affectedId, title }) => level + distribution + affectedId + title
  )

  if (!searchProps || searchProps.all) {
    return mergedAlerts
  }

  return mergedAlerts.filter(({ distribution, affectedId }) => {
    let match = false

    if (searchProps.route) {
      match =
        typeof searchProps.route === 'boolean'
          ? searchProps.route
          : distribution === AlertDistribution.Route && affectedId === searchProps.route
    }

    if (searchProps.stop) {
      match =
        typeof searchProps.stop === 'boolean'
          ? searchProps.stop
          : distribution === AlertDistribution.Stop && affectedId === searchProps.stop
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
