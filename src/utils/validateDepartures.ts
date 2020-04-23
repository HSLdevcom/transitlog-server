import { JoreDepartureWithOrigin } from '../types/Jore'
import { orderBy, groupBy } from 'lodash'

/**
 * This function ensures that all departures for a route are consecutive
 * consistently by the departure time and departure_id. Departure_id
 * must be incrementing consistently from one departure to the next,
 * and the departure time for a larger departure_id may not be earlier
 * than a departure with a smaller departure_id.
 * @param departures JoreDepartureWithOrigin[]
 */

export function validateDepartures(departures: JoreDepartureWithOrigin[]) {
  let validConsecutiveDepartures: JoreDepartureWithOrigin[] = []

  let groupedAndOrdered = Object.values(
    groupBy(departures, (dep) => `${dep.route_id}_${dep.direction}`)
  ).map((routeDepartures) => orderBy(routeDepartures, 'departure_id'))

  for (let routeDepartures of groupedAndOrdered) {
    let consecutiveRouteDepartures: JoreDepartureWithOrigin[] = []

    for (let departure of routeDepartures) {
      let prevDeparture = consecutiveRouteDepartures[consecutiveRouteDepartures.length - 1]

      if (!prevDeparture) {
        consecutiveRouteDepartures.push(departure)
        continue
      }

      let prevDepartureId = prevDeparture.departure_id
      let prevHours = prevDeparture.hours
      let prevMinutes = prevDeparture.minutes

      // Compare minutes if the hour is equal.
      let compareMinutes = prevHours === departure.hours

      if (
        ((compareMinutes && prevMinutes < departure.minutes) || prevHours < departure.hours) &&
        prevDepartureId < departure.departure_id
      ) {
        consecutiveRouteDepartures.push(departure)
      }
    }

    validConsecutiveDepartures = [...validConsecutiveDepartures, ...consecutiveRouteDepartures]
  }

  return validConsecutiveDepartures
}
