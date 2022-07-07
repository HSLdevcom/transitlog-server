import {
  AlertCategory,
  AlertImpact,
  AlertLevel,
  CancellationEffect,
  CancellationSubcategory,
  CancellationType,
  JourneyCancellationEvent,
  JourneyEvent,
  JourneyStopEvent,
  JourneyTlpEvent,
  PlannedStopEvent,
  TlpDecision,
  TlpReason,
  TlpRequestType,
} from './generated/schema-types'

export enum DBCancellationStatus {
  CANCELED = 'CANCELED',
  RUNNING = 'RUNNING',
}

export enum TlpPriorityLevelDb {
  Normal = 'normal',
  High = 'high',
  Norequest = 'norequest',
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
  ext_id_bulletin: string
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
  loc: Maybe<string>
  mode: Maybe<string>
  stop: Maybe<number>
  next_stop_id: Maybe<string>
  oday: string
  odo: number
  owner_operator_id: number
  route_id: Maybe<string>
  spd: Maybe<number>
  received_at: string
  tsi: string
  tst: string
  unique_vehicle_id: string
  vehicle_number: number
  seq: Maybe<number>
  _is_virtual?: boolean
}

export interface TlpEvents extends Vehicles {
  tlp_requestid: Maybe<number>
  tlp_requesttype: Maybe<TlpRequestType>
  tlp_prioritylevel: Maybe<TlpPriorityLevelDb>
  tlp_reason: Maybe<TlpReason>
  tlp_att_seq: Maybe<number>
  tlp_decision: Maybe<TlpDecision>
  sid: Maybe<number>
  signal_groupid: Maybe<number>
  tlp_signalgroupnbr: Maybe<number>
  tlp_line_configid: Maybe<number>
  tlp_point_configid: Maybe<number>
  tlp_frequency: Maybe<number>
  tlp_protocol: Maybe<string>
}

export type JourneyEvents = {
  vehiclePositions: Vehicles[]
  stopEvents: Vehicles[]
  otherEvents: Vehicles[]
  tlpEvents: TlpEvents[]
}

export type PassengerCount = {
  dir: Maybe<number>
  oper: Maybe<number>
  veh: Maybe<number>
  unique_vehicle_id: Maybe<string>
  route_id: Maybe<string>
  tst: string
  tsi: string
  latitude: Maybe<number>
  longitude: Maybe<number>
  oday: Maybe<string>
  start: Maybe<string>
  stop: Maybe<string>
  route: Maybe<string>
  passenger_count_quality: Maybe<string>
  vehicle_load: Maybe<number>
  vehicle_load_ratio: Maybe<number>
  total_passengers_in: Maybe<number>
  total_passengers_out: Maybe<number>
}

export type EventsType =
  | JourneyStopEvent
  | JourneyEvent
  | PlannedStopEvent
  | JourneyCancellationEvent
  | JourneyTlpEvent
