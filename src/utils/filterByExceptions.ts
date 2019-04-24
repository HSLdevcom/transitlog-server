import { groupBy, orderBy } from 'lodash'
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
  // Group both the departures and the exceptions by day type so we can look up any exceptions for each day type.
  const departuresByDayType = groupBy(departures, 'dayType')
  const exceptionsByDayType = groupBy(exceptions, 'dayType')

  for (const [dayType, dayDepartures] of Object.entries(departuresByDayType)) {
    // IF there are exceptions for the day type, we can be confident that other departures than
    // the normal weekday departures are in effect.
    if (exceptionsByDayType[dayType]) {
      // Figure out which exception or replacing day types are in effect for this dayType.
      const exceptions = exceptionsByDayType[dayType]

      // Collect all departures that are replacing the current dayType here.
      let departuresForDay: Departure[] = []

      // There may be many exceptions for a day type, and we need to process them separately.
      for (const exception of exceptions) {
        const exceptionDayTypes = orderBy(
          exception.effectiveDayTypes,
          // Any special exception days (eg. those that are not a normal week day)
          // should have priority, so sort them first in the array.
          (val) => (!dayTypes.includes(val) ? 1 : 0),
          'desc'
        )

        // Special departures for this exception
        let exceptionDepartures: Departure[] = []

        // Go through each exception day type in order from exceptions to replacements and see if
        // there are actually departures scheduled for the new day type.
        for (const exceptionDayType of exceptionDayTypes) {
          // See if we have departures for this special day type. Also make sure it does not equal
          // dayType, since that wouldn't make the day exceptional at all.
          if (exceptionDayType !== dayType && departuresByDayType[exceptionDayType]) {
            exceptionDepartures = departuresByDayType[exceptionDayType]
            break
          }
        }

        departuresForDay = [...departuresForDay, ...exceptionDepartures]
      }

      // If there were no departures scheduled for any exception day types, just use the normal departures.
      if (departuresForDay.length === 0) {
        departuresForDay = dayDepartures
      }

      // Add the departures we got to the return array.
      validDepartures = [...validDepartures, ...departuresForDay]
    } else {
      // The dayType does not have an exception or replacement, so just go with the normal day departures.
      validDepartures = [...validDepartures, ...dayDepartures]
    }
  }

  return validDepartures
}
