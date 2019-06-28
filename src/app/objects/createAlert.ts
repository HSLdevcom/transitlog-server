import { AlertDataType, DBAlert } from '../../types/EventsDb'
import {
  Alert,
  AlertCategory,
  AlertDistribution,
  AlertImpact,
  AlertLevel,
} from '../../types/generated/schema-types'
import { get } from 'lodash'
import moment from 'moment-timezone'
import { TZ } from '../../constants'

export function createAlert(alert: DBAlert, language: string = 'fi'): Alert {
  const alertLanguage = language === 'se' ? 'sv' : language

  const alertData: AlertDataType | null = alert.data || null
  let distribution = AlertDistribution.Network

  if (alert.affects_all_routes && alert.affects_all_stops) {
    distribution = AlertDistribution.Network
  } else if (alert.affects_all_routes) {
    distribution = AlertDistribution.AllRoutes
  } else if (alert.affects_all_stops) {
    distribution = AlertDistribution.AllStops
  } else if (alert.route_id) {
    distribution = AlertDistribution.Route
  } else if (alert.stop_id) {
    distribution = AlertDistribution.Stop
  }

  const titles = get(alertData, 'titles', [])
  const title = titles.find((title) => title.language === alertLanguage) || titles[0]

  const descriptions = get(alertData, 'descriptions', [])
  const description =
    descriptions.find((description) => description.language === alertLanguage) || descriptions[0]

  const urls = get(alertData, 'urls', [])
  const url = urls.find((url) => url.language === alertLanguage) || urls[0]

  return {
    id: alert.id,
    level: get(alertData, 'priority', AlertLevel.Info),
    category: get(alertData, 'category', AlertCategory.Other),
    distribution,
    impact: get(alertData, 'impact', AlertImpact.Unknown),
    affectedId: alert.route_id || alert.stop_id || '',
    startDateTime: moment.tz(alert.valid_from, TZ).toISOString(true),
    endDateTime: moment.tz(alert.valid_to, TZ).toISOString(true),
    lastModifiedDateTime: moment.tz(alert.last_modified, TZ).toISOString(true),
    title: get(title, 'text', ''),
    description: get(description, 'text', ''),
    url: get(url, 'text', null),
  }
}
