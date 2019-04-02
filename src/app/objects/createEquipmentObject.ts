import { JoreEquipment } from '../../types/Jore'
import { Equipment } from '../../types/generated/schema-types'
import { createUniqueVehicleId } from '../../utils/createUniqueVehicleId'
import { getOperatorName } from '../../utils/getOperatorName'
import get from 'lodash/get'

export function createEquipmentObject(item: JoreEquipment): Equipment {
  return {
    id: createUniqueVehicleId(item.operator_id, item.vehicle_id),
    vehicleId: item.vehicle_id,
    operatorId: item.operator_id || '',
    operatorName: getOperatorName(item.operator_id),
    age: parseInt(item.age || '0', 10),
    emissionClass: item.emission_class || '',
    emissionDesc: item.emission_desc || '',
    exteriorColor: item.exterior_color || '',
    registryNr: item.registry_nr,
    type: item.type || '',
    inService: get(item, 'inService', false) || false,
    _matchScore: get(item, '_matchScore', 0) || 0,
  }
}
