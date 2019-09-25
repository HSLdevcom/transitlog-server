import { getLatestCancellationState } from './getLatestCancellationState'
import {
  Alert,
  AlertDistribution,
  Cancellation,
  Departure,
} from '../types/generated/schema-types'
import { isWithinRange, parse } from 'date-fns'

export const setCancellationsOnDeparture = (
  departure: Departure,
  cancellations: Cancellation[]
) => {
  const departureTime = departure.originDepartureTime
    ? departure.originDepartureTime.departureTime
    : departure.plannedDepartureTime.departureTime

  const departureCancellations: Cancellation[] = cancellations.filter(
    (cancellation) =>
      cancellation.routeId === departure.routeId &&
      cancellation.direction === departure.direction &&
      departureTime.startsWith(cancellation.journeyStartTime)
  )

  const isCancelled =
    departureCancellations.length !== 0 &&
    getLatestCancellationState(departureCancellations)[0].isCancelled

  departure.isCancelled = isCancelled
  departure.cancellations = departureCancellations

  if (departure.journey) {
    departure.journey.cancellations = departureCancellations
    departure.journey.isCancelled = isCancelled
  }

  return { cancellations: departureCancellations, isCancelled, departure }
}

export const setAlertsOnDeparture = (departure: Departure, alerts: Alert[]) => {
  const alertTime = parse(
    departure.observedDepartureTime
      ? departure.observedDepartureTime.departureDateTime
      : departure.plannedDepartureTime.departureDateTime
  )

  const departureAlerts: Alert[] = []
  const stopAlerts: Alert[] = []

  for (const alert of alerts) {
    if (!isWithinRange(alertTime, alert.startDateTime, alert.endDateTime)) {
      continue
    }

    if (
      alert.distribution === AlertDistribution.AllStops ||
      alert.affectedId === departure.stopId
    ) {
      departureAlerts.push(alert)
      stopAlerts.push(alert)
    }

    if (
      alert.distribution === AlertDistribution.AllRoutes ||
      alert.affectedId === departure.routeId
    ) {
      departureAlerts.push(alert)
    }
  }

  departure.alerts = departureAlerts

  if (departure.journey) {
    departure.journey.alerts = departureAlerts
  }

  if (departure.stop) {
    departure.stop.alerts = stopAlerts
  }

  return { departureAlerts, stopAlerts }
}
