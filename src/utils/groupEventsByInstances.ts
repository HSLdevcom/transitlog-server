import { groupBy, orderBy } from 'lodash'
import { Vehicles } from '../types/generated/hfp-types'
import { createValidVehicleId } from './createUniqueVehicleId'

export const groupEventsByInstances = (events: Vehicles[] = []): Array<[string, Vehicles[]]> => {
  const vehicleIdGroups = groupBy(events, ({ unique_vehicle_id }) =>
    createValidVehicleId(unique_vehicle_id)
  )

  const entries = Object.entries(vehicleIdGroups)

  return orderBy(
    entries,
    ([uniqueVehicleId]) => {
      const [operatorId, vehicleId] = uniqueVehicleId.split('/')
      return parseInt(vehicleId, 10) + parseInt(operatorId, 10)
    },
    'asc'
  )
}
