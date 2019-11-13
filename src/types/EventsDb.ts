import {
  AlertCategory,
  AlertImpact,
  AlertLevel,
  CancellationEffect,
  CancellationSubcategory,
  CancellationType,
} from './generated/schema-types'

export enum DBCancellationStatus {
  CANCELED = 'CANCELED',
  RUNNING = 'RUNNING',
}

export type CancellationDataType = {
  title?: string
  category?: AlertCategory
  description?: string
  sub_category?: CancellationSubcategory
  deviation_cases_type?: CancellationType
  affected_departures_type?: CancellationEffect
}

export interface DBCancellation {
  id: number
  created_at: string
  modified_at: string
  status: DBCancellationStatus
  start_date: string
  route_id: string
  direction_id: number
  start_time: string
  last_modified: string
  data: CancellationDataType
}

export type AlertDataType = {
  title?: string
  category?: AlertCategory
  description?: string
  impact?: AlertImpact
  priority?: AlertLevel
}

export interface DBAlert {
  id: number
  created_at: string
  modified_at: string
  route_id: string
  stop_id: string
  affects_all_routes: boolean
  affects_all_stops: boolean
  valid_from: string
  valid_to: string
  last_modified: string
  data: AlertDataType
}

export type Maybe<T> = T | null

export type JourneyType = 'journey' | 'signoff' | 'deadrun'

export type EventType =
  | 'VP'
  | 'DUE'
  | 'ARR'
  | 'DEP'
  | 'ARS'
  | 'PDE'
  | 'PAS'
  | 'WAIT'
  | 'DOO'
  | 'DOC'
  | 'TLR'
  | 'TLA'
  | 'DA'
  | 'DOUT'
  | 'BA'
  | 'BOUT'
  | 'VJA'
  | 'VJOUT'

export interface Vehicles {
  journey_type: JourneyType
  event_type: EventType
  desi: Maybe<string>
  direction_id: Maybe<number>
  dl: Maybe<number>
  drst: Maybe<boolean>
  geohash_level: Maybe<number>
  hdg: Maybe<number>
  headsign: Maybe<string>
  journey_start_time: Maybe<string>
  lat: Maybe<number>
  line: Maybe<number>
  long: Maybe<number>
  mode: Maybe<string>
  stop: Maybe<number>
  next_stop_id: Maybe<string>
  oday: string
  odo: number
  owner_operator_id: number
  route_id: Maybe<string>
  spd: Maybe<number>
  tsi: string
  tst: string
  unique_vehicle_id: string
  vehicle_number: number
  _is_virtual?: boolean
}

export type JourneyEvents = {
  vehiclePositions: Vehicles[]
  stopEvents: Vehicles[]
  otherEvents: Vehicles[]
}
