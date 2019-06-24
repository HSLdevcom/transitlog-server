import { AlertDataType, DBAlert } from '../../types/EventsDb'
import {
  AlertCategory,
  AlertLevel,
  AlertDistribution,
  AlertImpact,
  Alert,
} from '../../types/generated/schema-types'
import { get } from 'lodash'
import moment from 'moment-timezone'
import { TZ } from '../../constants'

export function createAlert(alert: DBAlert): Alert {
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

  return {
    level: get(alertData, 'priority', AlertLevel.Info),
    category: get(alertData, 'category', AlertCategory.Other),
    distribution,
    impact: get(alertData, 'impact', AlertImpact.Unknown),
    affectedId: alert.route_id || alert.stop_id || '',
    startDateTime: moment.tz(alert.valid_from, TZ).toISOString(true),
    endDateTime: moment.tz(alert.valid_to, TZ).toISOString(true),
    lastModifiedDateTime: moment.tz(alert.last_modified, TZ).toISOString(true),
    title: get(alertData, 'titles[0].text', ''),
    description: get(alertData, 'descriptions[0].text', ''),
    url: get(alertData, 'urls[0].text', null),
  }
}
