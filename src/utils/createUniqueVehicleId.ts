import { VehicleId } from '../types/generated/schema-types'

export function createValidVehicleId(uniqueVehicleId: VehicleId = ''): string {
  if (!uniqueVehicleId) {
    return ''
  }

  const [operatorPart, vehicleIdPart] = uniqueVehicleId.split('/')
  return createUniqueVehicleId(operatorPart, vehicleIdPart)
}

export function createUniqueVehicleId(operatorId, vehicleId) {
  const operator = (operatorId + '').padStart(4, '0')
  return `${operator}/${vehicleId}`
}
