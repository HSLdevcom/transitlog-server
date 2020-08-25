import { JourneyStopEvent, JourneyTlpEvent, Scalars } from './generated/schema-types'
import { Vehicles } from './EventsDb'
import { getDirection } from '../utils/getDirection'
import { Mode } from './Jore'

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

export type Journey =
  | HFPJourneyObject
  | JourneyObject
  | Vehicles
  | JourneyStopEvent
  | JourneyTlpEvent

export type DepartureStop = {
  routeId: string
  direction: number
  stopId: string
  dateBegin: string
  dateEnd: string
  dateModified: Date
  isTimingStop: boolean
  shortId: string
  mode: Mode
}
