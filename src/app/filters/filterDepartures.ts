import { get } from 'lodash'
import { Departure, DepartureFilterInput } from '../../types/generated/schema-types'

export function filterDepartures(departures: Departure[], filter?: DepartureFilterInput) {
  const routeFilter = get(filter, 'routeId', '')
  const min: number = get(filter, 'minHour', -1) || -1
  const max: number = get(filter, 'maxHour', -1) || -1

  return departures.filter(({ routeId, plannedDepartureTime }) => {
    const departureTime = get(plannedDepartureTime, 'departureTime', '')
    const hours = parseInt(departureTime.split(':')[0], 10)

    if (hours && !isNaN(hours)) {
      // If there is a timerange filter set, ignore routes
      // from departures that fall outside the filter.
      if ((min > -1 && hours < min) || (max > -1 && hours > max)) {
        return false
      }
    }

    const routeIdFilterTerm = routeId.replace(/^0+/, '').toLowerCase()

    // Filer by route id if filter is set.
    if (routeFilter && !routeIdFilterTerm.includes(routeFilter.toLowerCase())) {
      return false
    }

    return true
  })
}
