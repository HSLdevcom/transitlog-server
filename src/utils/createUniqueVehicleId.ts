export function createUniqueVehicleId(operatorId, vehicleId) {
  const operator = (operatorId + '').padStart(4, '0')
  const vehicle = vehicleId + ''

  return `${operator}/${vehicle}`
}
