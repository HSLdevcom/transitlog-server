import { Equipment as JoreEquipment } from '../../types/generated/jore-types'
import { Equipment } from '../../types/generated/schema-types'
import { createUniqueVehicleId } from '../../utils/createUniqueVehicleId'
import { getOperatorName } from '../../utils/getOperatorName'
import get from 'lodash/get'

export function createEquipmentObject(item: JoreEquipment): Equipment {
  return {
    id: createUniqueVehicleId(item.operatorId, item.vehicleId),
    vehicleId: item.vehicleId,
    operatorId: item.operatorId || '',
    operatorName: getOperatorName(item.operatorId),
    age: parseInt(item.age || '0', 10),
    emissionClass: item.emissionClass || '',
    emissionDesc: item.emissionDesc || '',
    exteriorColor: item.exteriorColor || '',
    registryNr: item.registryNr,
    type: item.type || '',
    inService: get(item, 'inService', false) || false,
    _matchScore: get(item, '_matchScore', 0) || 0,
  }
}
