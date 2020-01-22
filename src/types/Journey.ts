import { JourneyStopEvent, Scalars } from './generated/schema-types'
import { Vehicles } from './EventsDb'

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
  direction: Scalars['Direction']
  departureTime: string
  uniqueVehicleId: Scalars['VehicleId']
}

export type Journey = HFPJourneyObject | JourneyObject | Vehicles | JourneyStopEvent
