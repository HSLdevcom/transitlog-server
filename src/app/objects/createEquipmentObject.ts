import { Equipment as JoreEquipment } from '../../types/generated/jore-types'
import { Equipment } from '../../types/generated/schema-types'
import { createUniqueVehicleId } from '../../utils/createUniqueVehicleId'

export function createEquipmentObject(
  item: JoreEquipment,
  inService?: boolean
): Equipment {
  const equipmentObject: Equipment = {
    id: createUniqueVehicleId(item.operatorId, item.vehicleId),
    vehicleId: item.vehicleId,
    operatorId: item.operatorId || '',
    age: parseInt(item.age || '0', 10),
    emissionClass: item.emissionClass || '',
    emissionDesc: item.emissionDesc || '',
    exteriorColor: item.exteriorColor || '',
    registryNr: item.registryNr,
    type: item.type || '',
  }

  if (typeof inService === 'boolean') {
    equipmentObject.inService = inService
  }

  return equipmentObject
}
