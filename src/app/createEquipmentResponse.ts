import { JoreEquipment } from '../types/Jore'
import { Equipment, EquipmentFilterInput } from '../types/generated/schema-types'
import { cacheFetch } from './cache'
import { createEquipmentObject } from './objects/createEquipmentObject'
import { get, orderBy } from 'lodash'
import { search } from './filters/search'
import { Vehicles } from '../types/generated/hfp-types'
import isToday from 'date-fns/is_today'
import { createUniqueVehicleId } from '../utils/createUniqueVehicleId'
import { CachedFetcher } from '../types/CachedFetcher'

const equipmentToSearchTerms = ({
  vehicleId,
  operatorId,
  operatorName,
  registryNr,
  exteriorColor,
  emissionClass,
  emissionDesc,
  type = '',
}: Equipment): string[] => [
  vehicleId,
  operatorId || '',
  operatorName || '',
  registryNr,
  exteriorColor || '',
  emissionClass || '',
  emissionDesc || '',
  type || '',
]

export async function createEquipmentResponse(
  getEquipment: () => Promise<JoreEquipment[]>,
  getObservedVehicles: () => Promise<Vehicles[]>,
  filter?: EquipmentFilterInput,
  date?: string
): Promise<Equipment[]> {
  const fetchEquipment: CachedFetcher<Equipment[]> = async () => {
    const equipment = await getEquipment()

    if (!equipment || equipment.length === 0) {
      return false
    }

    return equipment.map(createEquipmentObject)
  }

  const equipmentCacheKey = `equipment`
  const equipmentData = await cacheFetch<Equipment[]>(
    equipmentCacheKey,
    fetchEquipment,
    24 * 60 * 60
  )

  if (!equipmentData) {
    return []
  }

  if (!filter && !date) {
    return orderBy(equipmentData, ['operatorId', 'vehicleId'], ['asc', 'asc'])
  }

  const vehicleIdFilter = get(filter, 'vehicleId', '')
  const operatorIdFilter = get(filter, 'operatorId', '')
  const searchFilter = get(filter, 'search', '')

  let filteredEquipment = equipmentData

  if (vehicleIdFilter && operatorIdFilter) {
    filteredEquipment = equipmentData.filter(
      (item) => item.operatorId === operatorIdFilter && item.vehicleId === vehicleIdFilter
    )
  } else if (searchFilter || (vehicleIdFilter || operatorIdFilter)) {
    const searchQuery = searchFilter || `${vehicleIdFilter},${operatorIdFilter}`
    filteredEquipment = search<Equipment>(filteredEquipment, searchQuery, equipmentToSearchTerms)
  } else {
    filteredEquipment = orderBy(filteredEquipment, ['operatorId', 'vehicleId'], ['asc', 'asc'])
  }

  if (date) {
    const vehicleHfpCacheKey = `equipment_observed_${date}`
    const ttl = isToday(date) ? 5 * 60 : 0

    const vehicles: Vehicles[] =
      (await cacheFetch<Vehicles[]>(vehicleHfpCacheKey, getObservedVehicles, ttl)) || []

    if (vehicles.length !== 0) {
      filteredEquipment = filteredEquipment.map((item: Equipment) => {
        const vehicleId = item.id

        const observedVehicleId = vehicles.find(({ owner_operator_id, vehicle_number }) => {
          const hfpVehicleId = createUniqueVehicleId(owner_operator_id, vehicle_number)
          return hfpVehicleId === vehicleId
        })

        item.inService = !!observedVehicleId
        return item
      })
    }
  }

  return filteredEquipment
}
