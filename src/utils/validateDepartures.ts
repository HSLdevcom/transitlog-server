import { JoreDepartureWithOrigin } from '../types/Jore'
import { groupBy, orderBy } from 'lodash'

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
    groupBy(departures, (dep) => `${dep.route_id}_${dep.direction}_${dep.day_type}`)
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
      const previousTime =
        prevDeparture.hours * 3600 + prevDeparture.minutes * 60 + (prevDeparture.seconds ?? 0)
      const currentTime =
        departure.hours * 3600 + departure.minutes * 60 + (departure.seconds ?? 0)

      if (previousTime < currentTime && prevDepartureId < departure.departure_id) {
        consecutiveRouteDepartures.push(departure)
      }
    }

    validConsecutiveDepartures = [...validConsecutiveDepartures, ...consecutiveRouteDepartures]
  }

  return validConsecutiveDepartures
}
