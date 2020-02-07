import { StopRoute } from './generated/schema-types'

export type Maybe<T> = T | null

export enum Mode {
  Bus = 'BUS',
  Tram = 'TRAM',
  Rail = 'RAIL',
  Subway = 'SUBWAY',
  Ferry = 'FERRY',
}

/** A floating point number that requires more precision than IEEE 754 binary 64 */
export type BigFloat = number

/** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
export type Json = string

// ====================================================
// Types
// ====================================================

export interface JoreDepartureOperator {
  hours: number
  minutes: number
  operator_id: string
  route_id: string
  direction: string
}

export interface JoreOriginDeparture {
  hours: number
  minutes: number
  stop_id: string
  departure_id: number
  is_next_day: boolean
  extra_departure: string
  day_type: string
  route_id: string
  direction: string
  date_begin: string
  date_end: string
}

export interface JoreDeparture {
  stop_id: string
  route_id: string
  direction: string
  day_type: string
  departure_id: number
  is_next_day: boolean
  hours: number
  minutes: number
  is_accessible: boolean
  date_begin: string
  date_end: string
  stop_role: number
  vehicle?: Maybe<string>
  note?: Maybe<string>
  arrival_is_next_day: boolean
  arrival_hours: number
  arrival_minutes: number
  extra_departure: string
  terminal_time?: Maybe<number>
  recovery_time?: Maybe<number>
  equipment_type?: Maybe<string>
  equipment_required?: Maybe<number>
  bid_target_id?: Maybe<string>
  operator_id?: Maybe<string>
  available_operators?: Maybe<string>
  trunk_color_required?: Maybe<number>
  is_regular_day_departure?: Maybe<boolean>
  origin_departure?: Maybe<JoreOriginDeparture>
}

export interface JoreStop {
  stop_id: string
  lat: BigFloat
  lon: BigFloat
  name_fi: string
  name_se?: Maybe<string>
  address_fi?: Maybe<string>
  address_se?: Maybe<string>
  platform?: Maybe<string>
  short_id: string
  heading?: Maybe<string>
  stop_radius?: Maybe<number>
  terminal_id?: Maybe<string>
  stop_area_id?: Maybe<string>
  poster_count?: Maybe<number>
  driveby_timetable?: Maybe<number>
  stop_type?: Maybe<string>
  distribution_area?: Maybe<string>
  distribution_order?: Maybe<number>
  stop_zone?: Maybe<string>
  stop_tariff?: Maybe<string>
  point?: Maybe<string>
  modes: Maybe<Mode[] | Mode>
  mode: Maybe<Mode>
  timing_stop_type?: number
  route_id?: string
  direction?: string
  date_begin?: string
  date_end?: string
  routes?: StopRoute[]
}

export interface JoreTerminal {
  terminal_id: string
  name_fi: string
  name_se: string
  lat: number
  lon: number
  date_imported: string
}

export interface JoreRoute {
  route_id: string
  date_begin: string
  date_end: string
  direction: string
  name_fi: string
  name_se?: Maybe<string>
  route_name: string
  type: string
  origin_fi: string
  origin_se?: Maybe<string>
  originstop_id: string
  route_length: number
  destination_fi: string
  destination_se?: Maybe<string>
  destinationstop_id: string
  duration?: Maybe<number>
  has_regular_day_departures?: Maybe<boolean>
  mode?: Maybe<Mode>
}

export interface JoreNote {
  line_id: string
  note_id: number
  noteType: string
  noteText: string
  date_begin: string
  date_end: string
}

export interface JoreGeometry {
  geometry?: Maybe<Json>
  date_begin: string
  date_end: string
}

export interface JoreRouteSegment {
  stop_id: string
  next_stop_id?: Maybe<string>
  route_id: string
  direction: string
  date_begin: string
  date_end: string
  duration: number
  stop_index: number
  distance_from_previous: number
  distance_from_start: number
  pickup_dropoff_type?: Maybe<number>
  destination_fi?: Maybe<string>
  destination_se?: Maybe<string>
  via_fi?: Maybe<string>
  via_se?: Maybe<string>
  timing_stop_type: number
  has_regular_day_departures?: Maybe<boolean>
}

export type JoreRouteData = JoreRoute & JoreRouteSegment & JoreStop
export type JoreRouteDepartureData = JoreRoute &
  JoreRouteSegment &
  JoreStop &
  JoreDeparture & { departure_date_begin?: string; departure_date_end?: string }

export type JoreStopSegment = JoreRouteSegment & JoreStop & JoreRoute & { mode: Maybe<string> }

interface JoreOriginDepartureProps {
  origin_stop_id?: string
  origin_hours?: number
  origin_minutes?: number
  origin_departure_id?: number
  origin_is_next_day?: boolean
  origin_extra_departure?: string
  origin_date_begin?: string
  origin_date_end?: string
}

export type JoreDepartureWithOrigin = JoreDeparture & JoreOriginDepartureProps

export interface JoreEquipment {
  class?: Maybe<string>
  registry_nr: string
  vehicle_id: string
  age?: Maybe<string>
  type?: Maybe<string>
  multi_axle?: Maybe<number>
  exterior_color?: Maybe<string>
  operator_id?: Maybe<string>
  emission_class?: Maybe<string>
  emission_desc?: Maybe<string>
}

export interface JoreGeometry {
  route_id: string
  direction: string
  date_begin: string
  date_end: string
  geom: string
}

export interface JorePointGeometry {
  route_id: string
  direction: string
  date_begin: string
  date_end: string
  stop_id: string
  node_type: string
  index: number
  y: number
  x: number
  point?: Maybe<string>
}

export interface JoreExceptionDay {
  date_in_effect: string
  effective_day_types: Array<string | null>
  description: Maybe<string>
  day_type: string
  scoped_day_type: Maybe<string>
  exclusive: number
  scope: Maybe<string>
  time_begin: Maybe<string>
  time_end: Maybe<string>
}
