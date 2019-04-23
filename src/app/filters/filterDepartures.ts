import { get } from 'lodash'
import { Departure, DepartureFilterInput } from '../../types/generated/schema-types'
import { getDirection } from '../../utils/getDirection'

export function filterDepartures(departures: Departure[], filter?: DepartureFilterInput) {
  const routeFilter =
    (get(filter, 'routeId', '') || '').replace(/^0+/, '').toLowerCase() || undefined
  const directionFilter = getDirection(get(filter, 'direction')) || undefined
  const min: number = get(filter, 'minHour', -1) || -1
  const max: number = get(filter, 'maxHour', -1) || -1

  if (min === -1 && max === -1 && !routeFilter && !directionFilter) {
    return departures
  }

  return departures.filter(({ routeId, direction, plannedDepartureTime }) => {
    const routeIdFilterTerm = routeId.replace(/^0+/, '').toLowerCase()
    const directionFilterTerm = getDirection(direction)

    // Filter by route id if filter is set.
    if (routeFilter && routeIdFilterTerm !== routeFilter) {
      return false
    }

    if (directionFilter && directionFilterTerm !== directionFilter) {
      return false
    }

    const departureTime = get(plannedDepartureTime, 'departureTime', '')
    const hours = parseInt(departureTime.split(':')[0], 10)

    if (hours && !isNaN(hours)) {
      // If there is a timerange filter set, ignore routes
      // from departures that fall outside the filter.
      if ((min > -1 && hours < min) || (max > -1 && hours > max)) {
        return false
      }
    }

    return true
  })
}
