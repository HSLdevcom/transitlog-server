import { getCancellations } from '../app/getCancellations'
import { getLatestCancellationState } from './getLatestCancellationState'
import { Departure } from '../types/generated/schema-types'
import { getAlerts } from '../app/getAlerts'
import { get } from 'lodash'

export const setCancellationsOnDeparture = (departure: Departure) => {
  const cancellations = getCancellations(departure.plannedDepartureTime.departureDateTime, {
    routeId: departure.routeId,
    direction: departure.direction,
    departureTime: departure.plannedDepartureTime.departureTime.slice(0, 5),
  })

  const isCancelled =
    cancellations.length !== 0 && getLatestCancellationState(cancellations)[0].isCancelled

  departure.isCancelled = isCancelled
  departure.cancellations = cancellations

  if (departure.journey) {
    departure.journey.cancellations = cancellations
    departure.journey.isCancelled = isCancelled
  }

  return { cancellations, isCancelled, departure }
}

export const setAlertsOnDeparture = (departure: Departure) => {
  const alertTime = departure.observedDepartureTime
    ? departure.observedDepartureTime.departureDateTime
    : departure.plannedDepartureTime.departureDateTime

  const alerts = getAlerts(departure.plannedDepartureTime.departureDateTime, {
    allStops: true,
    allRoutes: true,
    route: departure.routeId,
    stop: departure.stopId,
  })

  departure.alerts = alerts

  if (departure.journey) {
    departure.journey.alerts = getAlerts(
      get(
        departure,
        'observedDepartureTime.departureDateTime',
        get(departure, 'journey.events[0].recordedAt', alertTime)
      ),
      {
        allStops: true,
        allRoutes: true,
        route: departure.journey.routeId,
        stop: departure.journey.originStopId || departure.stopId,
      }
    )
  }

  if (departure.stop) {
    departure.stop.alerts = getAlerts(alertTime, { allStops: true, stop: departure.stopId })
  }

  return alerts
}
