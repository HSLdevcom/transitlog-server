import { filterByDateChains } from './filterByDateChains'
import { groupBy } from 'lodash'
import { Departure } from '../types/generated/jore-types'
import { createDepartureId } from '../app/objects/createDepartureObject'

export function getValidDepartures(departures: Departure[], date?: string) {
  const groupedDepartures = groupBy(departures, createDepartureId)
  return filterByDateChains<Departure>(groupedDepartures, date)
}
