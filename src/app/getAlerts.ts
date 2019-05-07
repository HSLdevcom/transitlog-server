import { Alert, AlertDistribution, AlertLevel } from '../types/generated/schema-types'
import format from 'date-fns/format'
import { getDateFromDateTime } from '../utils/time'

export const getAlerts = (
  date = format(new Date(), 'YYYY-MM-DD'),
  network?: boolean,
  route?: string,
  stop?: string
) => {
  const alerts: Alert[] = []

  if (route) {
    alerts.push({
      title: `Route ${route} alien abduction`,
      affectedId: route,
      id: '123',
      alertLevel: AlertLevel.Disruption,
      description: 'An alien abducted the driver.',
      distribution: AlertDistribution.Route,
      startDateTime: getDateFromDateTime(date, '08:10:00'),
      endDateTime: getDateFromDateTime(date, '09:10:00'),
      url: 'https://hsl.fi',
    })
    alerts.push({
      title: 'Herttoniemi sinkhole',
      affectedId: route,
      id: '456',
      alertLevel: AlertLevel.Disruption,
      description: `A sinkhole opened up in Herttoniemi and swallowed one of route ${route}'s buses.`,
      distribution: AlertDistribution.Route,
      startDateTime: getDateFromDateTime(date, '13:00:00'),
      endDateTime: getDateFromDateTime(date, '14:00:00'),
      url: 'https://hsl.fi',
    })
  }

  if (stop) {
    alerts.push({
      title: 'C-zoner protest',
      affectedId: stop,
      id: '789',
      alertLevel: AlertLevel.Disruption,
      description: `A protester from Myyrmäki has smashed stop ${stop} to bits as they were unhappy to be placed in Zone C.`,
      distribution: AlertDistribution.Stop,
      startDateTime: getDateFromDateTime(date, '10:34:00'),
      endDateTime: getDateFromDateTime(date, '23:59:00'),
      url: 'https://hsl.fi',
    })
  }

  if (network) {
    alerts.push({
      title: 'Driver strike',
      affectedId: 'network',
      id: '101112',
      alertLevel: AlertLevel.Crisis,
      description: `All the drivers have gone on strike. All of them.`,
      distribution: AlertDistribution.Network,
      startDateTime: getDateFromDateTime(date, '06:00:00'),
      endDateTime: getDateFromDateTime(date, '23:59:00'),
      url: 'https://hsl.fi',
    })
  }

  return alerts
}
