import { groupBy, orderBy, uniqBy } from 'lodash'
import { Departure, ExceptionDay } from '../types/generated/schema-types'
import { dayTypes } from './dayTypes'

export const filterByExceptions = (
  departures: Departure[],
  exceptions: ExceptionDay[] = []
): Departure[] => {
  // No exceptions, no worries!
  if (!exceptions) {
    return departures
  }

  // This is what we will return from this function. Collect all departures that are valid here.
  let validDepartures: Departure[] = []

  // Departures grouped by route.
  const routeGroups = Object.values(
    groupBy(departures, ({ routeId, direction }) => `${routeId}/${direction}`)
  )

  for (const routeDepartures of routeGroups) {
    const departuresByDate = groupBy(routeDepartures, 'plannedDepartureTime.departureDate')

    for (const [departureDate, dateDepartures] of Object.entries(departuresByDate)) {
      // Get an exception in effect for the current departure date.
      const exception = exceptions.find(({ exceptionDate }) => exceptionDate === departureDate)

      if (exception) {
        // Collect all departures that are replacing the current dayType here.
        let departuresForDate: Departure[] = []

        const exceptionDayTypes = orderBy(
          exception.effectiveDayTypes,
          // Any special exception days (eg. those that are not a normal week day)
          // should have priority, so sort them first in the array.
          (val) => (!dayTypes.includes(val) ? 1 : 0),
          'desc'
        )

        // Go through each exception day type in order from exceptions to replacements and see if
        // there are actually departures scheduled for the new day type.
        for (const exceptionDayType of exceptionDayTypes) {
          const departuresForDayType = dateDepartures.filter(
            ({ dayType: departureDayType }) => departureDayType === exceptionDayType
          )

          if (departuresForDayType.length !== 0) {
            departuresForDate = departuresForDayType.map((departure) => {
              // The departure will be of an abnormal type, so add the normal dayType here
              // in order to match observed events with this departure.
              departure._normalDayType = exception.dayType
              return departure
            })
            break
          }
        }

        // If there were no departures scheduled for any exception day types, just use the normal departures.
        if (departuresForDate.length === 0) {
          departuresForDate = dateDepartures
        }

        // Add the departures we got to the return array.
        validDepartures = [...validDepartures, ...departuresForDate]
      }

      // We need to include special days that don't match an
      // exception by dayType but are exception departures
      if (!exception) {
        validDepartures = [...validDepartures, ...dateDepartures]
      }
    }
  }

  return uniqBy(validDepartures, 'id')
}
