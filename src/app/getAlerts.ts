import {
  Alert,
  AlertCategory,
  AlertDistribution,
  AlertImpact,
  AlertLevel,
} from '../types/generated/schema-types'
import { getDateFromDateTime } from '../utils/time'
import { isMoment, Moment } from 'moment'
import moment from 'moment-timezone'
import { TZ } from '../constants'
import { mapValues, orderBy } from 'lodash'

// Needed only for mocks
interface PartialAlert {
  title: string
  affectedId: string
  description: string
  level: AlertLevel
  distribution: AlertDistribution
  category: AlertCategory
  impact: AlertImpact
  startDateTime: Moment
  endDateTime: Moment
}

// Mock alert data
const availableAlerts = (date): PartialAlert[] => [
  {
    title: `Route 1014 alien abduction`,
    affectedId: '1014',
    description: 'An alien abducted the driver.',
    level: AlertLevel.Warning,
    distribution: AlertDistribution.Route,
    category: AlertCategory.NoDriver,
    impact: AlertImpact.Cancelled,
    startDateTime: getDateFromDateTime(date, '08:00:00'),
    endDateTime: getDateFromDateTime(date, '11:00:00'),
  },
  {
    title: `Buses are full`,
    affectedId: '1014',
    description: 'Many buses are full right now.',
    level: AlertLevel.Info,
    distribution: AlertDistribution.Route,
    category: AlertCategory.TooManyPassengers,
    impact: AlertImpact.IrregularDepartures,
    startDateTime: getDateFromDateTime(date, '10:15:00'),
    endDateTime: getDateFromDateTime(date, '12:15:00'),
  },
  {
    title: 'C-zoner protest',
    affectedId: '1060104',
    description: `A protester from Myyrmäki has smashed stop 1060104 to bits as they were unhappy to be placed in Zone C.`,
    distribution: AlertDistribution.Stop,
    level: AlertLevel.Warning,
    category: AlertCategory.Assault,
    impact: AlertImpact.DisruptionRoute,
    startDateTime: getDateFromDateTime(date, '05:00:00'),
    endDateTime: getDateFromDateTime(date, '11:00:00'),
  },
  {
    title: 'Stop is crowded',
    affectedId: '1060104',
    description: `There are too many people waiting at the stop.`,
    distribution: AlertDistribution.Stop,
    level: AlertLevel.Info,
    category: AlertCategory.TooManyPassengers,
    impact: AlertImpact.NoTrafficImpact,
    startDateTime: getDateFromDateTime(date, '05:15:00'),
    endDateTime: getDateFromDateTime(date, '12:15:00'),
  },
  {
    title: 'C-zoner protest',
    affectedId: '1050112',
    description: `A protester from Myyrmäki has smashed stop 1050112 to bits as they were unhappy to be placed in Zone C.`,
    distribution: AlertDistribution.Stop,
    level: AlertLevel.Warning,
    category: AlertCategory.Assault,
    impact: AlertImpact.DisruptionRoute,
    startDateTime: getDateFromDateTime(date, '05:00:00'),
    endDateTime: getDateFromDateTime(date, '11:00:00'),
  },
  {
    title: 'Stop is crowded',
    affectedId: '1050112',
    description: `There are too many people waiting at the stop.`,
    distribution: AlertDistribution.Stop,
    level: AlertLevel.Info,
    category: AlertCategory.TooManyPassengers,
    impact: AlertImpact.NoTrafficImpact,
    startDateTime: getDateFromDateTime(date, '07:15:00'),
    endDateTime: getDateFromDateTime(date, '19:15:00'),
  },
  {
    title: `No oil`,
    affectedId: '',
    description: 'The world ran out of oil so no buses are running today sorry.',
    level: AlertLevel.Severe,
    distribution: AlertDistribution.AllRoutes,
    category: AlertCategory.VehicleDeficit,
    impact: AlertImpact.Cancelled,
    startDateTime: getDateFromDateTime(date, '06:00:00'),
    endDateTime: getDateFromDateTime(date, '23:59:00'),
  },
  {
    title: 'Departure displays buggy',
    affectedId: '',
    description: 'The central system controlling all stop displays has stopped working.',
    distribution: AlertDistribution.Network,
    level: AlertLevel.Severe,
    category: AlertCategory.ItsSystemError,
    impact: AlertImpact.PossiblyDelayed,
    startDateTime: getDateFromDateTime(date, '06:00:00'),
    endDateTime: getDateFromDateTime(date, '18:00:00'),
  },
]

// Needed only for mocks
const defaultAlertProps = {
  url: 'https://hsl.fi',
  publishedDateTime: getDateFromDateTime('2019-05-09', '12:34:01'),
}

type AlertSearchProps = {
  all?: boolean
  network?: boolean
  allRoutes?: boolean
  allStops?: boolean
  route?: string | string[]
  stop?: string | string[]
}

export const getAlerts = (dateTime: Moment | string, searchProps: AlertSearchProps = {}) => {
  const time = moment.tz(dateTime, TZ)
  const date = time.format('YYYY-MM-DD')

  // If this function was supplied only a date string, include all alerts
  // for this date regardless of time.
  const includeAllForDate = dateTime === date

  const alerts = availableAlerts(date)
    .filter((alert) => {
      if (
        searchProps.all ||
        (searchProps.network && alert.distribution === AlertDistribution.Network)
      ) {
        return true
      }

      if (searchProps.allRoutes && alert.distribution === AlertDistribution.AllRoutes) {
        return true
      }

      if (searchProps.allStops && alert.distribution === AlertDistribution.AllStops) {
        return true
      }

      if (
        alert.distribution === AlertDistribution.Stop &&
        (searchProps.stop && Array.isArray(searchProps.stop)
          ? searchProps.stop.includes(alert.affectedId)
          : alert.affectedId === searchProps.stop)
      ) {
        return true
      }

      if (
        alert.distribution === AlertDistribution.Route &&
        (searchProps.route && Array.isArray(searchProps.route)
          ? searchProps.route.includes(alert.affectedId)
          : alert.affectedId === searchProps.route)
      ) {
        return true
      }

      return false
    })
    .filter((alert) =>
      time.isBetween(
        alert.startDateTime,
        alert.endDateTime,
        includeAllForDate ? 'day' : 'minute',
        '[]'
      )
    )

  return orderBy(
    alerts,
    [
      ({ level }) => (level === AlertLevel.Severe ? 3 : level === AlertLevel.Warning ? 2 : 1),
      ({ startDateTime, endDateTime }) => endDateTime.unix() / 2 + startDateTime.unix() / 2,
    ],
    ['desc', 'desc']
  ).map(
    (alert): Alert => {
      const fullAlert: Alert = { ...defaultAlertProps, ...alert }
      return mapValues(fullAlert, (val) => (isMoment(val) ? val.toISOString(true) : val)) as Alert
    }
  )
}
