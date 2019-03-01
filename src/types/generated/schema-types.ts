export type Maybe<T> = T | null

export interface EquipmentFilterInput {
  vehicleId?: Maybe<string>

  operatorId?: Maybe<string>

  search?: Maybe<string>
}

export interface StopFilterInput {
  search?: Maybe<string>

  bbox?: Maybe<BBox>
}

export interface RouteFilterInput {
  routeId?: Maybe<string>

  direction?: Maybe<Direction>

  search?: Maybe<string>
}

export interface LineFilterInput {
  search?: Maybe<string>

  includeLinesWithoutRoutes?: Maybe<boolean>
}

export interface DepartureFilterInput {
  routeId?: Maybe<string>

  direction?: Maybe<Direction>
}

export enum CacheControlScope {
  Public = 'PUBLIC',
  Private = 'PRIVATE',
}

/** A Date string in YYYY-MM-DD format. The timezone is assumed to be Europe/Helsinki. */
export type Date = any

/** A string that defines a bounding box. The coordinates should be in the format `minLng,maxLat,maxLng,minLat` which is compatible with what Leaflet's LatLngBounds.toBBoxString() returns. */
export type BBox = any

/** The direction of a route. An integer of either 1 or 2. */
export type Direction = any

/** Time is seconds from 00:00:00 in format HH:mm:ss. The hours value can be more than 23. The timezone is assumed to be Europe/Helsinki */
export type Time = any

/** A DateTime string in ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ). Timezone will be converted to Europe/Helsinki. */
export type DateTime = any

/** A string that uniquely identifies a vehicle. The format is [operator ID]/[vehicle ID]. The operator ID is padded to have a length of 4 characters. */
export type VehicleId = any

/** The `Upload` scalar type represents a file upload. */
export type Upload = any

// ====================================================
// Scalars
// ====================================================

// ====================================================
// Interfaces
// ====================================================

/** Any object that describes something with a position implements this interface. */
export interface Position {
  lat: number

  lng: number
}

// ====================================================
// Types
// ====================================================

export interface Query {
  equipment: Array<Maybe<Equipment>>

  stops: Array<Maybe<Stop>>

  routes: Array<Maybe<Route>>

  routeGeometry?: Maybe<RouteGeometry>

  lines: Array<Maybe<Line>>

  departures: Array<Maybe<Departure>>

  journey?: Maybe<Journey>
}

export interface Equipment {
  id: string

  vehicleId: string

  operatorId: string

  registryNr: string

  age: number

  type: string

  exteriorColor: string

  emissionDesc: string

  emissionClass: string

  inService?: Maybe<boolean>

  _matchScore?: Maybe<number>
}

export interface Stop extends Position {
  id: string

  stopId: string

  shortId: string

  lat: number

  lng: number

  name?: Maybe<string>

  radius?: Maybe<number>

  modes: Array<Maybe<string>>

  _matchScore?: Maybe<number>
}

export interface Route {
  id: string

  lineId: string

  routeId: string

  direction: Direction

  destination?: Maybe<string>

  origin?: Maybe<string>

  name?: Maybe<string>

  destinationStopId?: Maybe<string>

  originStopId?: Maybe<string>

  _matchScore?: Maybe<number>
}

export interface RouteGeometry {
  coordinates: RouteGeometryPoint[]
}

export interface RouteGeometryPoint extends Position {
  lat: number

  lng: number
}

export interface Line {
  id: string

  lineId: string

  name?: Maybe<string>

  _matchScore?: Maybe<number>
}

export interface Departure {
  id: string

  stopId: string

  dayType: string

  equipmentType?: Maybe<string>

  equipmentIsRequired?: Maybe<boolean>

  equipmentColor?: Maybe<string>

  operatorId?: Maybe<string>

  routeId: string

  direction: Direction

  terminalTime?: Maybe<number>

  recoveryTime?: Maybe<number>

  departureId?: Maybe<number>

  extraDeparture?: Maybe<string>

  isNextDay?: Maybe<boolean>

  isTimingStop?: Maybe<boolean>

  index?: Maybe<number>

  stop: DepartureStop

  plannedArrivalTime?: Maybe<PlannedArrival>

  observedArrivalTime?: Maybe<ObservedArrival>

  plannedDepartureTime?: Maybe<PlannedDeparture>

  observedDepartureTime?: Maybe<ObservedDeparture>
}

export interface DepartureStop {
  id: string

  destination?: Maybe<string>

  distanceFromPrevious?: Maybe<number>

  distanceFromStart?: Maybe<number>

  duration?: Maybe<number>

  stopIndex?: Maybe<number>

  isTimingStop?: Maybe<boolean>

  stopId: string

  shortId: string

  lat: number

  lng: number

  name?: Maybe<string>

  radius?: Maybe<number>

  modes: Array<Maybe<string>>
}

export interface PlannedArrival {
  arrivalDate: Date

  arrivalTime: Time

  arrivalDateTime: DateTime
}

export interface ObservedArrival {
  arrivalEvent: JourneyEvent

  arrivalDate: Date

  arrivalTime: Time

  arrivalDateTime: DateTime

  arrivalTimeDifference: number

  doorDidOpen: boolean
}

export interface JourneyEvent extends Position {
  receivedAt: DateTime

  recordedAt: DateTime

  recordedAtUnix: number

  recordedTime: Time

  nextStopId?: Maybe<string>

  lat: number

  lng: number

  doorStatus?: Maybe<boolean>

  velocity?: Maybe<number>

  delay?: Maybe<number>

  heading?: Maybe<number>
}

export interface PlannedDeparture {
  departureDate: Date

  departureTime: Time

  departureDateTime: DateTime
}

export interface ObservedDeparture {
  departureEvent: JourneyEvent

  departureDate: Date

  departureTime: Time

  departureDateTime: DateTime

  departureTimeDifference: number
}

export interface Journey {
  id: string

  lineId: string

  routeId: string

  direction: Direction

  departureDate: Date

  departureTime: Time

  uniqueVehicleId?: Maybe<VehicleId>

  operatorId?: Maybe<string>

  vehicleId?: Maybe<string>

  instance?: Maybe<number>

  headsign?: Maybe<string>

  name?: Maybe<string>

  equipment: Equipment

  events: Array<Maybe<JourneyEvent>>

  departures: Array<Maybe<Departure>>
}

// ====================================================
// Arguments
// ====================================================

export interface EquipmentQueryArgs {
  filter?: Maybe<EquipmentFilterInput>

  date?: Maybe<Date>
}
export interface StopsQueryArgs {
  filter?: Maybe<StopFilterInput>
}
export interface RoutesQueryArgs {
  filter?: Maybe<RouteFilterInput>

  date?: Maybe<Date>
}
export interface RouteGeometryQueryArgs {
  routeId: string

  direction: Direction

  date: Date
}
export interface LinesQueryArgs {
  filter?: Maybe<LineFilterInput>

  date?: Maybe<Date>

  includeLinesWithoutRoutes?: Maybe<boolean>
}
export interface DeparturesQueryArgs {
  filter?: Maybe<DepartureFilterInput>

  stopId?: Maybe<string>

  date: Date
}
export interface JourneyQueryArgs {
  routeId: string

  direction: Direction

  departureTime: Time

  departureDate: Date

  instance?: Maybe<number>
}
