import { JoreEquipment } from '../types/Jore'
import { Equipment } from '../types/generated/schema-types'
import { cacheFetch } from '../cache'
import { createEquipmentObject } from '../objects/createEquipmentObject'
import { orderBy } from 'lodash'
import isToday from 'date-fns/is_today'
import { createUniqueVehicleId, matchOperatorId } from '../utils/createUniqueVehicleId'
import { CachedFetcher } from '../types/CachedFetcher'
import { Vehicles } from '../types/EventsDb'
import { AuthenticatedUser } from '../types/Authentication'
import { getUserGroups } from '../auth/requireUser'

export async function createEquipmentResponse(
  getEquipment: () => Promise<JoreEquipment[]>,
  getObservedVehicles: () => Promise<Vehicles[]>,
  user: AuthenticatedUser,
  date?: string,
  skipCache = false
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
    24 * 60 * 60,
    skipCache
  )

  if (!equipmentData || !user) {
    return []
  }

  const vehiclesList = orderBy(equipmentData, ['operatorId', 'vehicleId'], ['asc', 'asc'])

  if (!date) {
    return vehiclesList
  }

  const userGroups = getUserGroups(user)
  const authorizedResults = userGroups.includes('HSL') ? vehiclesList : []

  if (userGroups.includes('operator')) {
    const authenticatedOperatorIds = userGroups
      .filter((group) => group.startsWith('op_'))
      .map((group) => group.replace('op_', '').padStart(4, '0'))

    if (authenticatedOperatorIds.length !== 0) {
      for (const vehicle of vehiclesList) {
        if (matchOperatorId(authenticatedOperatorIds, vehicle.operatorId)) {
          authorizedResults.push(vehicle)
        }
      }
    }
  }

  let equipmentResponse = authorizedResults

  if (date && equipmentResponse.length !== 0) {
    const vehicleHfpCacheKey = `equipment_observed_${date}`
    const ttl = isToday(date) ? 5 * 60 : 24 * 60 * 60

    const vehicles: Vehicles[] | null = await cacheFetch<Vehicles[]>(
      vehicleHfpCacheKey,
      getObservedVehicles,
      ttl,
      skipCache
    )

    if (!vehicles || vehicles.length === 0) {
      return equipmentResponse
    }

    equipmentResponse = equipmentResponse.map((item: Equipment) => {
      const vehicleId = item.id

      const observedVehicleId = vehicles.find(({ owner_operator_id, vehicle_number }) => {
        const hfpVehicleId = createUniqueVehicleId(owner_operator_id, vehicle_number)
        return hfpVehicleId === vehicleId
      })

      item.inService = !!observedVehicleId
      return item
    })
  }

  return equipmentResponse
}
