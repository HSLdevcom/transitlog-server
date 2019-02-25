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
}

export interface LineFilterInput {
  lineId?: Maybe<string>
}

export interface DepartureFilterInput {
  routeId?: Maybe<string>

  direction?: Maybe<Direction>
}

export enum Direction {
  D1 = 'D1',
  D2 = 'D2',
}

export enum CacheControlScope {
  Public = 'PUBLIC',
  Private = 'PRIVATE',
}

/** A Date string in YYYY-MM-DD format. */
export type Date = any

/** A string that defines a bounding box. The coordinates should be in the format `minLng,maxLat,maxLng,minLat` which is compatible with what Leaflet's LatLngBounds.toBBoxString() returns. */
export type BBox = any

/** Time is seconds from 00:00:00 in format HH:mm:ss. The hours value can be more than 23. */
export type Time = any

/** A DateTime string in ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ). Timezone will be converted to the server timezone. */
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
  equipment: (Maybe<Equipment>)[]

  stops: (Maybe<Stop>)[]

  routes: (Maybe<Route>)[]

  routeGeometry?: Maybe<RouteGeometry>

  lines: (Maybe<Line>)[]

  departures: (Maybe<Departure>)[]

  journey?: Maybe<Journey>
}

export interface Equipment {
  id: string

  vehicleId: string

  operatorId: string

  registryNr: string

  age?: Maybe<number>

  type: string

  exteriorColor?: Maybe<string>

  class?: Maybe<string>

  emissionDesc?: Maybe<string>

  emissionClass?: Maybe<string>
}

export interface Stop extends Position {
  id: string

  stopId: string

  shortId: string

  lat: number

  lng: number

  name?: Maybe<string>

  radius?: Maybe<number>

  modes: (Maybe<string>)[]
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

  stop: Stop

  plannedArrivalTime: PlannedArrival

  observedArrivalTime?: Maybe<PlannedArrival>

  plannedDepartureTime: PlannedDeparture

  observedDepartureTime?: Maybe<ObservedDeparture>
}

export interface PlannedArrival {
  arrivalDate: Date

  arrivalTime: Time

  arrivalDateTime: DateTime
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

export interface Journey {
  id: string

  routeId: string

  direction: Direction

  departureDate: Date

  departureTime: Time

  uniqueVehicleId?: Maybe<VehicleId>

  operatorId?: Maybe<string>

  vehicleId?: Maybe<string>

  instance?: Maybe<number>

  headsign?: Maybe<string>

  equipment: Equipment

  events: (Maybe<JourneyEvent>)[]

  departures: (Maybe<Departure>)[]
}

export interface ObservedArrival {
  arrivalEvent?: Maybe<JourneyEvent>

  arrivalDate?: Maybe<Date>

  arrivalTime?: Maybe<Time>

  arrivalDateTime?: Maybe<DateTime>

  arrivalTimeDifference?: Maybe<number>

  doorDidOpen: boolean
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
}
