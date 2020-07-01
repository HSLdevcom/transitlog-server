import { groupBy, orderBy } from 'lodash'
import { createValidVehicleId } from './createUniqueVehicleId'
import { Vehicles } from '../types/EventsDb'

export const groupEventsByInstances = (
  events: Vehicles[] = [],
  preserveInstances: boolean = false // true to not use seq
): Array<[string, Vehicles[]]> => {
  let onlyFirstVehicleInSequence = events
  let hasSeq = events.some((evt) => !!evt.seq)

  // For events with seq information, select only seq==1 or seq==null events.
  if (!preserveInstances && hasSeq) {
    onlyFirstVehicleInSequence = events.filter((evt) => !evt.seq || evt.seq === 1)
  }

  const vehicleIdGroups = groupBy(onlyFirstVehicleInSequence, ({ unique_vehicle_id }) =>
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
