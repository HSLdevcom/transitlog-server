import { groupBy, orderBy } from 'lodash'
import { Vehicles } from '../types/generated/hfp-types'

export const groupEventsByInstances = (events: Vehicles[] = []): Vehicles[][] => {
  const vehicleIdGroups = groupBy(events, 'unique_vehicle_id')
  const entries = Object.entries(vehicleIdGroups)

  const sortedGroups = orderBy(
    entries,
    ([uniqVehicleId]) => {
      const [operatorId, vehicleId] = uniqVehicleId.split('/')
      return parseInt(vehicleId, 10) + parseInt(operatorId, 10)
    },
    'asc'
  )

  return sortedGroups.map(([vehicleId, instanceEvents]) => instanceEvents)
}
