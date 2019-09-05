import { getLatestCancellationState } from './getLatestCancellationState'
import { Departure } from '../types/generated/schema-types'
import { get } from 'lodash'

export const setCancellationsOnDeparture = async (departure: Departure, getCancellations) => {
  const departureTime = departure.originDepartureTime
    ? departure.originDepartureTime.departureTime
    : departure.plannedDepartureTime.departureTime

  const cancellations = await getCancellations(departure.plannedDepartureTime.departureDate, {
    routeId: departure.routeId,
    direction: departure.direction,
    departureTime: departureTime.slice(0, 5),
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

export const setAlertsOnDeparture = async (departure: Departure, getAlerts) => {
  const alertTime = departure.observedDepartureTime
    ? departure.observedDepartureTime.departureDateTime
    : departure.plannedDepartureTime.departureDateTime

  const alerts = await getAlerts(departure.plannedDepartureTime.departureDateTime, {
    allStops: true,
    allRoutes: true,
    route: departure.routeId,
    stop: departure.stopId,
  })

  departure.alerts = alerts

  if (departure.journey) {
    departure.journey.alerts = alerts
  }

  if (departure.stop) {
    departure.stop.alerts = await getAlerts(alertTime, { allStops: true, stop: departure.stopId })
  }

  return alerts
}
