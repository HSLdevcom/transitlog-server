import { groupBy, orderBy, flatten } from 'lodash'
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
  const departuresByDayType = groupBy(departures, 'dayType')

  for (const [dayType, dayDepartures] of Object.entries(departuresByDayType)) {
    // If there are exceptions for the day type, we can be confident that other departures than
    // the normal weekday departures are in effect.
    const exception = exceptions.find(
      ({ dayType: exceptionDayType }) => exceptionDayType === dayType
    )

    if (exception) {
      // Collect all departures that are replacing the current dayType here.
      let departuresForDay: Departure[] = []

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
        // See if we have departures for this special day type. Also make sure it does not equal
        // dayType, since that wouldn't make the day exceptional at all.
        if (exceptionDayType !== dayType && departuresByDayType[exceptionDayType]) {
          departuresForDay = departuresByDayType[exceptionDayType]
          break
        }
      }

      // If there were no departures scheduled for any exception day types, just use the normal departures.
      if (departuresForDay.length === 0) {
        departuresForDay = dayDepartures
      }

      // Add the departures we got to the return array.
      validDepartures = [...validDepartures, ...departuresForDay]
    }

    // We need to include special days that don't match an
    // exception by dayType but are exception departures
    if (
      !exception ||
      flatten(exceptions.map(({ effectiveDayTypes }) => effectiveDayTypes)).includes(dayType)
    ) {
      // The dayType does not have an exception or replacement, so just go with the normal day departures.
      validDepartures = [...validDepartures, ...dayDepartures]
    }
  }

  return validDepartures
}
