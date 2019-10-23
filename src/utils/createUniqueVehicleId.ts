import { VehicleId } from '../types/generated/schema-types'

export function createValidVehicleId(uniqueVehicleId: VehicleId = ''): string {
  if (!uniqueVehicleId) {
    return ''
  }

  const [operatorPart, vehicleIdPart] = uniqueVehicleId.split('/')
  return createUniqueVehicleId(operatorPart, vehicleIdPart)
}

// Create a unique vehicle ID from a vehicle ID and operator ID
export function createUniqueVehicleId(operatorId, vehicleId) {
  const operator = (operatorId + '').padStart(4, '0')
  return `${operator}/${vehicleId}`
}

// Vehicle IDs in the HFP database don't have leading zeroes for the operator part.
// This should only be used for querying the HFP database.
export function createHfpVehicleId(
  uniqueVehicleIdOrOperator: string,
  vehicleId?: string | number
): string {
  let operatorId: string | number = ''
  let useVehicleId: string | number = ''

  if (vehicleId) {
    useVehicleId = vehicleId
    operatorId = parseInt(uniqueVehicleIdOrOperator, 10)
  } else {
    const [operatorPart, vehiclePart] = uniqueVehicleIdOrOperator.split('/')
    operatorId = parseInt(operatorPart, 10)
    useVehicleId = parseInt(vehiclePart, 10)
  }

  return `${operatorId}/${useVehicleId}`
}

export function matchOperatorId(a: string | string[], b: string) {
  let operators: string[] = []

  if (Array.isArray(a)) {
    operators = a.map((op) => op.padStart(4, '0'))
  } else {
    operators.push(a.padStart(4, '0'))
  }

  const operatorB = b.padStart(4, '0')
  return operators.includes(operatorB)
}
