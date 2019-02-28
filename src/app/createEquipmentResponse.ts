import { Equipment as JoreEquipment } from '../types/generated/jore-types'
import { Equipment, EquipmentFilterInput } from '../types/generated/schema-types'
import { cacheFetch } from './cache'
import { createEquipmentObject } from './objects/createEquipmentObject'
import { get, orderBy } from 'lodash'
import { search } from './filters/search'
import { Vehicles } from '../types/generated/hfp-types'
import isToday from 'date-fns/is_today'
import { createUniqueVehicleId } from '../utils/createUniqueVehicleId'

const equipmentToSearchTerms = ({
  vehicleId,
  operatorId,
  registryNr,
  exteriorColor,
  emissionClass,
  emissionDesc,
  type = '',
}: JoreEquipment): string[] => [
  vehicleId,
  operatorId || '',
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
  const equipmentCacheKey = `equipment`
  const equipment = await cacheFetch<JoreEquipment>(
    equipmentCacheKey,
    getEquipment,
    24 * 60 * 60
  )

  if (!equipment) {
    return []
  }

  if (!filter && !date) {
    return orderBy(
      equipment.map(createEquipmentObject),
      ['operatorId', 'vehicleId'],
      ['asc', 'asc']
    )
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

  if (date) {
    const vehicleHfpCacheKey = `equipment_observed_${date}`
    const ttl = isToday(date) ? 5 * 60 : 24 * 60 * 60
    const vehicles: Vehicles[] =
      (await cacheFetch<Vehicles>(vehicleHfpCacheKey, getObservedVehicles, ttl)) || []

    if (vehicles.length !== 0) {
      filteredEquipment = filteredEquipment.map((item: JoreEquipment) => {
        const vehicleId = createUniqueVehicleId(item.operatorId, item.vehicleId)

        const observedVehicleId = vehicles.find(
          ({ owner_operator_id, vehicle_number }) => {
            const hfpVehicleId = createUniqueVehicleId(owner_operator_id, vehicle_number)
            return hfpVehicleId === vehicleId
          }
        )

        // @ts-ignore
        item.inService = !!observedVehicleId
        return item
      })
    }
  }

  return filteredEquipment.map(createEquipmentObject)
}
