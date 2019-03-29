import { Direction, VehicleId } from './generated/schema-types'

export interface HFPJourneyObject {
  oday?: string
  route_id?: string | null
  direction_id?: number
  journey_start_time?: string
  instance?: number
}

export interface JourneyObject {
  departureDate: string
  routeId: string
  direction: Direction
  departureTime: string
  uniqueVehicleId: VehicleId
}

export type Journey = HFPJourneyObject | JourneyObject
