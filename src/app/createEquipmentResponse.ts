import { Equipment as JoreEquipment } from '../types/generated/jore-types'
import { Equipment, EquipmentFilterInput } from '../types/generated/schema-types'
import { cacheFetch } from './cache'
import { createEquipmentObject } from './objects/createEquipmentObject'
import { get } from 'lodash'
import { search } from './filters/search'

const equipmentToSearchTerms = ({
  vehicleId,
  operatorId,
  registryNr,
  exteriorColor,
  emissionClass,
  type = '',
}: JoreEquipment): string[] => [
  vehicleId,
  operatorId || '',
  registryNr,
  exteriorColor || '',
  emissionClass || '',
  type || '',
]

export async function createEquipmentResponse(
  getEquipment: () => Promise<JoreEquipment[]>,
  filter?: EquipmentFilterInput,
  date?: string
): Promise<Equipment[]> {
  const equipmentCacheKey = `equipment`
  const equipment = await cacheFetch<JoreEquipment>(
    equipmentCacheKey,
    getEquipment,
    86400
  )

  if (!equipment) {
    return []
  }

  if (!filter && !date) {
    return equipment.map((item) => createEquipmentObject(item))
  }

  const vehicleIdFilter = get(filter, 'vehicleId', '')
  const operatorIdFilter = get(filter, 'operatorId', '')
  const searchFilter = get(filter, 'search', '')

  let filteredEquipment = equipment

  if (vehicleIdFilter && operatorIdFilter) {
    filteredEquipment = equipment.filter(
      (item) => item.operatorId === operatorIdFilter && item.vehicleId === vehicleIdFilter
    )
  } else if (searchFilter || (vehicleIdFilter || operatorIdFilter)) {
    const searchQuery = searchFilter || `${vehicleIdFilter},${operatorIdFilter}`
    filteredEquipment = search<JoreEquipment>(
      filteredEquipment,
      searchQuery,
      equipmentToSearchTerms
    )
  }

  return filteredEquipment.map((item) => createEquipmentObject(item))
}
