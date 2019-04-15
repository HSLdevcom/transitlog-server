export type Maybe<T> = T | null

export interface EquipmentFilterInput {
  vehicleId?: Maybe<string>

  operatorId?: Maybe<string>

  search?: Maybe<string>
}

export interface StopFilterInput {
  search?: Maybe<string>
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

  minHour?: Maybe<number>

  maxHour?: Maybe<number>
}

export interface AreaEventsFilterInput {
  routeId?: Maybe<string>

  direction?: Maybe<Direction>
}

export enum CacheControlScope {
  Public = 'PUBLIC',
  Private = 'PRIVATE',
}

/** A Date string in YYYY-MM-DD format. The timezone is assumed to be Europe/Helsinki. */
export type Date = any

/** The direction of a route. An integer of either 1 or 2. */
export type Direction = any

/** A string that defines a bounding box. The coordinates should be in the format `minLng,maxLat,maxLng,minLat` which is compatible with what Leaflet's LatLngBounds.toBBoxString() returns. Toe coordinates will be rounded, use PreciseBBox if this is not desired. */
export type BBox = any

/** Time is seconds from 00:00:00 in format HH:mm:ss. The hours value can be more than 23. The timezone is assumed to be Europe/Helsinki */
export type Time = any

/** A string that uniquely identifies a vehicle. The format is [operator ID]/[vehicle ID]. The operator ID is padded to have a length of 4 characters. */
export type VehicleId = any

/** A DateTime string in ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ). Timezone will be converted to Europe/Helsinki. */
export type DateTime = any

/** A string that defines a bounding box. The coordinates should be in the format `minLng,maxLat,maxLng,minLat` which is compatible with what Leaflet's LatLngBounds.toBBoxString() returns. The precise bbox is not rounded. */
export type PreciseBBox = any

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
  lat?: Maybe<number>

  lng?: Maybe<number>
}

// ====================================================
// Types
// ====================================================

export interface Query {
  equipment: Array<Maybe<Equipment>>

  stop?: Maybe<Stop>

  stops: Array<Maybe<SimpleStop>>

  stopsByBbox: Array<Maybe<SimpleStop>>

  route?: Maybe<Route>

  routes: Array<Maybe<Route>>

  routeGeometry?: Maybe<RouteGeometry>

  routeSegments: Array<Maybe<RouteSegment>>

  lines: Array<Maybe<Line>>

  departures: Array<Maybe<Departure>>

  routeDepartures: Array<Maybe<Departure>>

  exceptionDays: Array<Maybe<ExceptionDay>>

  journey?: Maybe<Journey>

  journeys: Array<Maybe<Journey>>

  vehicleJourneys: Array<Maybe<VehicleJourney>>

  eventsByBbox: Array<Maybe<AreaJourney>>
}

export interface Equipment {
  id: string

  vehicleId: string

  operatorId: string

  operatorName?: Maybe<string>

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

  routes: Array<Maybe<StopRoute>>
}

export interface StopRoute {
  id: string

  originStopId?: Maybe<string>

  lineId?: Maybe<string>

  routeId: string

  direction: Direction

  isTimingStop: boolean

  mode?: Maybe<string>
}

export interface SimpleStop extends Position {
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

  originStopId: string

  mode?: Maybe<string>

  _matchScore?: Maybe<number>
}

export interface RouteGeometry {
  id: string

  mode?: Maybe<string>

  coordinates: RouteGeometryPoint[]
}

export interface RouteGeometryPoint extends Position {
  lat: number

  lng: number
}

export interface RouteSegment extends Position {
  id: string

  lineId?: Maybe<string>

  routeId: string

  direction: Direction

  originStopId?: Maybe<string>

  destination: string

  distanceFromPrevious?: Maybe<number>

  distanceFromStart?: Maybe<number>

  duration?: Maybe<number>

  stopIndex: number

  isTimingStop: boolean

  stopId: string

  shortId: string

  lat: number

  lng: number

  name?: Maybe<string>

  radius?: Maybe<number>

  modes: Array<Maybe<string>>
}

export interface Line {
  id: string

  lineId: string

  name?: Maybe<string>

  routesCount?: Maybe<number>

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

  mode?: Maybe<string>

  stop?: Maybe<RouteSegment>

  journey?: Maybe<DepartureJourney>

  plannedArrivalTime?: Maybe<PlannedArrival>

  observedArrivalTime?: Maybe<ObservedArrival>

  plannedDepartureTime?: Maybe<PlannedDeparture>

  observedDepartureTime?: Maybe<ObservedDeparture>
}

export interface DepartureJourney {
  id: string

  lineId?: Maybe<string>

  routeId: string

  direction: Direction

  originStopId?: Maybe<string>

  departureDate: Date

  departureTime: Time

  uniqueVehicleId?: Maybe<VehicleId>

  mode?: Maybe<string>

  events?: Maybe<JourneyEvent[]>

  _numInstance?: Maybe<number>
}

export interface JourneyEvent extends Position {
  id: string

  receivedAt: DateTime

  recordedAt: DateTime

  recordedAtUnix: number

  recordedTime: Time

  nextStopId?: Maybe<string>

  lat?: Maybe<number>

  lng?: Maybe<number>

  doorStatus?: Maybe<boolean>

  velocity?: Maybe<number>

  delay?: Maybe<number>

  heading?: Maybe<number>
}

export interface PlannedArrival {
  id: string

  arrivalDate: Date

  arrivalTime: Time

  arrivalDateTime: DateTime

  isNextDay?: Maybe<boolean>
}

export interface ObservedArrival {
  id: string

  arrivalEvent: JourneyEvent

  arrivalDate: Date

  arrivalTime: Time

  arrivalDateTime: DateTime

  arrivalTimeDifference: number

  doorDidOpen: boolean
}

export interface PlannedDeparture {
  id: string

  departureDate: Date

  departureTime: Time

  departureDateTime: DateTime

  isNextDay?: Maybe<boolean>
}

export interface ObservedDeparture {
  id: string

  departureEvent: JourneyEvent

  departureDate: Date

  departureTime: Time

  departureDateTime: DateTime

  departureTimeDifference: number
}

export interface ExceptionDay {
  id: string

  exceptionDate: Date

  effectiveDayTypes: string[]

  dayType: string

  modeScope?: Maybe<string>

  description?: Maybe<string>

  exclusive: boolean

  startTime?: Maybe<Time>

  endTime?: Maybe<Time>
}

export interface Journey {
  id: string

  lineId?: Maybe<string>

  routeId: string

  direction: Direction

  originStopId?: Maybe<string>

  departureDate: Date

  departureTime: Time

  uniqueVehicleId?: Maybe<VehicleId>

  operatorId?: Maybe<string>

  vehicleId?: Maybe<string>

  headsign?: Maybe<string>

  name?: Maybe<string>

  mode?: Maybe<string>

  equipment?: Maybe<Equipment>

  events: JourneyEvent[]

  departures: Departure[]
}

export interface VehicleJourney {
  id: string

  lineId?: Maybe<string>

  routeId: string

  direction: Direction

  originStopId?: Maybe<string>

  departureDate: Date

  departureTime: Time

  uniqueVehicleId?: Maybe<VehicleId>

  operatorId?: Maybe<string>

  vehicleId?: Maybe<string>

  headsign?: Maybe<string>

  mode?: Maybe<string>

  receivedAt: DateTime

  recordedAt: DateTime

  recordedAtUnix: number

  recordedTime: Time

  timeDifference: number

  nextStopId: string
}

export interface AreaJourney {
  id: string

  lineId?: Maybe<string>

  routeId: string

  direction: Direction

  departureDate: Date

  departureTime: Time

  uniqueVehicleId?: Maybe<VehicleId>

  operatorId?: Maybe<string>

  vehicleId?: Maybe<string>

  headsign?: Maybe<string>

  mode?: Maybe<string>

  events: Array<Maybe<JourneyEvent>>
}

// ====================================================
// Arguments
// ====================================================

export interface EquipmentQueryArgs {
  filter?: Maybe<EquipmentFilterInput>

  date?: Maybe<Date>
}
export interface StopQueryArgs {
  stopId: string

  date: Date
}
export interface StopsQueryArgs {
  filter?: Maybe<StopFilterInput>
}
export interface StopsByBboxQueryArgs {
  filter?: Maybe<StopFilterInput>

  bbox: BBox
}
export interface RouteQueryArgs {
  routeId: string

  direction: Direction

  date: Date
}
export interface RoutesQueryArgs {
  filter?: Maybe<RouteFilterInput>

  line?: Maybe<string>

  date?: Maybe<Date>
}
export interface RouteGeometryQueryArgs {
  routeId: string

  direction: Direction

  date: Date
}
export interface RouteSegmentsQueryArgs {
  routeId: string

  direction: Direction

  date: Date
}
export interface LinesQueryArgs {
  filter?: Maybe<LineFilterInput>

  date?: Maybe<Date>

  includeLinesWithoutRoutes?: boolean
}
export interface DeparturesQueryArgs {
  filter?: Maybe<DepartureFilterInput>

  stopId: string

  date: Date
}
export interface RouteDeparturesQueryArgs {
  stopId: string

  routeId: string

  direction: Direction

  date: Date
}
export interface ExceptionDaysQueryArgs {
  year: string
}
export interface JourneyQueryArgs {
  routeId: string

  direction: Direction

  departureTime: Time

  departureDate: Date

  uniqueVehicleId?: Maybe<VehicleId>
}
export interface JourneysQueryArgs {
  routeId: string

  direction: Direction

  departureDate: Date
}
export interface VehicleJourneysQueryArgs {
  uniqueVehicleId: VehicleId

  date: Date
}
export interface EventsByBboxQueryArgs {
  minTime: DateTime

  maxTime: DateTime

  bbox: PreciseBBox

  date: Date

  filters?: Maybe<AreaEventsFilterInput>
}
