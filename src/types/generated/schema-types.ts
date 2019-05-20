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

export interface AlertSearchInput {
  all?: Maybe<boolean>

  network?: Maybe<boolean>

  allRoutes?: Maybe<boolean>

  allStops?: Maybe<boolean>

  route?: Maybe<string>

  stop?: Maybe<string>
}

export enum AlertLevel {
  Info = 'INFO',
  Warning = 'WARNING',
  Severe = 'SEVERE',
}

export enum AlertCategory {
  VehicleBreakdown = 'VEHICLE_BREAKDOWN',
  Accident = 'ACCIDENT',
  NoDriver = 'NO_DRIVER',
  Assault = 'ASSAULT',
  Weather = 'WEATHER',
  VehicleOffTheRoad = 'VEHICLE_OFF_THE_ROAD',
  Seizure = 'SEIZURE',
  ItsSystemError = 'ITS_SYSTEM_ERROR',
  OtherDriverError = 'OTHER_DRIVER_ERROR',
  TooManyPassengers = 'TOO_MANY_PASSENGERS',
  Strike = 'STRIKE',
  Other = 'OTHER',
  EarlierDisruption = 'EARLIER_DISRUPTION',
  NoTrafficDisruption = 'NO_TRAFFIC_DISRUPTION',
  TrackBlocked = 'TRACK_BLOCKED',
  StaffDeficit = 'STAFF_DEFICIT',
  Disturbance = 'DISTURBANCE',
  VehicleDeficit = 'VEHICLE_DEFICIT',
  RoadClosed = 'ROAD_CLOSED',
  RoadTrench = 'ROAD_TRENCH',
  TrackMaintenance = 'TRACK_MAINTENANCE',
  TrafficAccident = 'TRAFFIC_ACCIDENT',
  TrafficJam = 'TRAFFIC_JAM',
  MedicalIncident = 'MEDICAL_INCIDENT',
  WeatherConditions = 'WEATHER_CONDITIONS',
  TechnicalFailure = 'TECHNICAL_FAILURE',
  Test = 'TEST',
  RoadMaintenance = 'ROAD_MAINTENANCE',
  SwitchFailure = 'SWITCH_FAILURE',
  StateVisit = 'STATE_VISIT',
  PowerFailure = 'POWER_FAILURE',
  MisparkedVehicle = 'MISPARKED_VEHICLE',
  PublicEvent = 'PUBLIC_EVENT',
}

export enum AlertDistribution {
  Stop = 'STOP',
  AllStops = 'ALL_STOPS',
  Route = 'ROUTE',
  AllRoutes = 'ALL_ROUTES',
  Network = 'NETWORK',
}

export enum AlertImpact {
  Delayed = 'DELAYED',
  PossiblyDelayed = 'POSSIBLY_DELAYED',
  ReducedTransport = 'REDUCED_TRANSPORT',
  Cancelled = 'CANCELLED',
  PossibleDeviations = 'POSSIBLE_DEVIATIONS',
  ReturningToNormal = 'RETURNING_TO_NORMAL',
  DisruptionRoute = 'DISRUPTION_ROUTE',
  DeviatingSchedule = 'DEVIATING_SCHEDULE',
  IrregularDepartures = 'IRREGULAR_DEPARTURES',
  IrregularDeparturesMax_15 = 'IRREGULAR_DEPARTURES_MAX_15',
  IrregularDeparturesMax_30 = 'IRREGULAR_DEPARTURES_MAX_30',
  VendingMachineOutOfOrder = 'VENDING_MACHINE_OUT_OF_ORDER',
  BicycleStationOutOfOrder = 'BICYCLE_STATION_OUT_OF_ORDER',
  BicycleSystemOutOfOrder = 'BICYCLE_SYSTEM_OUT_OF_ORDER',
  ReducedBicycleParkCapacity = 'REDUCED_BICYCLE_PARK_CAPACITY',
  Other = 'OTHER',
  NoTrafficImpact = 'NO_TRAFFIC_IMPACT',
  Unknown = 'UNKNOWN',
}

export enum CancellationSubcategory {
  BreakMalfunction = 'BREAK_MALFUNCTION',
  OutOfFuel = 'OUT_OF_FUEL',
  FluidLeakage = 'FLUID_LEAKAGE',
  ElectricMalfunction = 'ELECTRIC_MALFUNCTION',
  EngineMalfunction = 'ENGINE_MALFUNCTION',
  OtherMalfunction = 'OTHER_MALFUNCTION',
  OwnFault = 'OWN_FAULT',
  OppositeFault = 'OPPOSITE_FAULT',
  FaultUnknown = 'FAULT_UNKNOWN',
  StaffShortage = 'STAFF_SHORTAGE',
  NdOperatorPlanningError = 'ND_OPERATOR_PLANNING_ERROR',
  DriverLate = 'DRIVER_LATE',
  InsufficientInstructionsByOperator = 'INSUFFICIENT_INSTRUCTIONS_BY_OPERATOR',
  InsufficientInstructionsByAuthority = 'INSUFFICIENT_INSTRUCTIONS_BY_AUTHORITY',
  NoVehicleAvailable = 'NO_VEHICLE_AVAILABLE',
  AssaultOnDriver = 'ASSAULT_ON_DRIVER',
  AssaultOnPassenger = 'ASSAULT_ON_PASSENGER',
  AssaultOnVehicle = 'ASSAULT_ON_VEHICLE',
  PassedOutPassenger = 'PASSED_OUT_PASSENGER',
  OtherAssault = 'OTHER_ASSAULT',
  UndriveableConditions = 'UNDRIVEABLE_CONDITIONS',
  StuckCausedBySlippery = 'STUCK_CAUSED_BY_SLIPPERY',
  CongestionCausedByWeather = 'CONGESTION_CAUSED_BY_WEATHER',
  SlipperyTrack = 'SLIPPERY_TRACK',
  RoadBlocked = 'ROAD_BLOCKED',
  VehicleOffTheRoadByDriverError = 'VEHICLE_OFF_THE_ROAD_BY_DRIVER_ERROR',
  VehicleOffTheRoadByOtherReason = 'VEHICLE_OFF_THE_ROAD_BY_OTHER_REASON',
  MissparkedVehicle = 'MISSPARKED_VEHICLE',
  CongestionReasonUknown = 'CONGESTION_REASON_UKNOWN',
  CongestionCausedByAccident = 'CONGESTION_CAUSED_BY_ACCIDENT',
  DriverSeizure = 'DRIVER_SEIZURE',
  PassengerSeizure = 'PASSENGER_SEIZURE',
  PassengerInjured = 'PASSENGER_INJURED',
  OtherSeizure = 'OTHER_SEIZURE',
  DeviceError = 'DEVICE_ERROR',
  OperatorDeviceError = 'OPERATOR_DEVICE_ERROR',
  WrongInformationInDevice = 'WRONG_INFORMATION_IN_DEVICE',
  ItsSystemNotInstalled = 'ITS_SYSTEM_NOT_INSTALLED',
  UserError = 'USER_ERROR',
  FalseAlarm = 'FALSE_ALARM',
  OtherItsError = 'OTHER_ITS_ERROR',
  DriverError = 'DRIVER_ERROR',
  InsufficientCapasity = 'INSUFFICIENT_CAPASITY',
  OperatorPersonnelOnStrike = 'OPERATOR_PERSONNEL_ON_STRIKE',
  OtherStrike = 'OTHER_STRIKE',
  OtherOperatorReason = 'OTHER_OPERATOR_REASON',
  UnknownCause = 'UNKNOWN_CAUSE',
}

export enum CancellationType {
  CancelDeparture = 'CANCEL_DEPARTURE',
  Detour = 'DETOUR',
  SkippedStopCalls = 'SKIPPED_STOP_CALLS',
  EarlyDeparture = 'EARLY_DEPARTURE',
  EarlyDepartureFromTimingPoint = 'EARLY_DEPARTURE_FROM_TIMING_POINT',
  LateDeparture = 'LATE_DEPARTURE',
  DeparturedAfterNextJourney = 'DEPARTURED_AFTER_NEXT_JOURNEY',
  BlockFirstDepartureLate = 'BLOCK_FIRST_DEPARTURE_LATE',
  TisError = 'TIS_ERROR',
}

export enum CancellationEffect {
  CancelEntireDeparture = 'CANCEL_ENTIRE_DEPARTURE',
  CancelStopsFromStart = 'CANCEL_STOPS_FROM_START',
  CancelStopsFromMiddle = 'CANCEL_STOPS_FROM_MIDDLE',
  CancelStopsFromEnd = 'CANCEL_STOPS_FROM_END',
}

export enum CacheControlScope {
  Public = 'PUBLIC',
  Private = 'PRIVATE',
}

/** A Date string in YYYY-MM-DD format. The timezone is assumed to be Europe/Helsinki. */
export type Date = any

/** The direction of a route. An integer of either 1 or 2. */
export type Direction = any

/** A DateTime string in ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ). Timezone will be converted to Europe/Helsinki. */
export type DateTime = any

/** A string that defines a bounding box. The coordinates should be in the format `minLng,maxLat,maxLng,minLat` which is compatible with what Leaflet's LatLngBounds.toBBoxString() returns. Toe coordinates will be rounded, use PreciseBBox if this is not desired. */
export type BBox = any

/** Time is seconds from 00:00:00 in format HH:mm:ss. The hours value can be more than 23. The timezone is assumed to be Europe/Helsinki */
export type Time = any

/** A string that uniquely identifies a vehicle. The format is [operator ID]/[vehicle ID]. The operator ID is padded to have a length of 4 characters. */
export type VehicleId = any

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

  weeklyDepartures: Array<Maybe<Departure>>

  exceptionDays: Array<Maybe<ExceptionDay>>

  journey?: Maybe<Journey>

  journeys: Array<Maybe<Journey>>

  vehicleJourneys: Array<Maybe<VehicleJourney>>

  eventsByBbox: Array<Maybe<AreaJourney>>

  alerts: Array<Maybe<Alert>>
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

  routes: StopRoute[]

  alerts: Alert[]
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

export interface Alert {
  level: AlertLevel

  category: AlertCategory

  distribution: AlertDistribution

  impact: AlertImpact

  affectedId: string

  startDateTime: DateTime

  endDateTime: DateTime

  publishedDateTime: DateTime

  updatedDateTime?: Maybe<DateTime>

  title: string

  description: string

  url?: Maybe<string>
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

  alerts: Alert[]
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

  alerts: Alert[]

  cancellations: Cancellation[]

  _matchScore?: Maybe<number>
}

export interface Cancellation {
  routeId: string

  direction: Direction

  departureDate: Date

  journeyStartTime: Time

  title: string

  description: string

  category: AlertCategory

  subCategory: CancellationSubcategory

  isCancelled: boolean

  cancellationType: CancellationType

  cancellationEffect: CancellationEffect

  lastModifiedDateTime: DateTime
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

  alerts: Alert[]

  cancellations: Cancellation[]
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

  departureId: number

  departureTime: Time

  departureDate: Date

  extraDeparture: string

  isNextDay: boolean

  isTimingStop: boolean

  index?: Maybe<number>

  mode: string

  stop: RouteSegment

  journey?: Maybe<DepartureJourney>

  alerts: Alert[]

  cancellations: Cancellation[]

  isCancelled: boolean

  originDepartureTime?: Maybe<PlannedDeparture>

  plannedArrivalTime: PlannedArrival

  observedArrivalTime?: Maybe<ObservedArrival>

  plannedDepartureTime: PlannedDeparture

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

  alerts: Alert[]

  cancellations: Cancellation[]

  isCancelled: boolean

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

export interface PlannedDeparture {
  id: string

  departureDate: Date

  departureTime: Time

  departureDateTime: DateTime

  isNextDay?: Maybe<boolean>
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

  alerts: Alert[]

  cancellations: Cancellation[]

  isCancelled: boolean
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

  alerts: Alert[]

  cancellations: Cancellation[]

  isCancelled: boolean
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

  alerts: Alert[]

  cancellations: Cancellation[]

  isCancelled: boolean
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
export interface WeeklyDeparturesQueryArgs {
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
export interface AlertsQueryArgs {
  time?: Maybe<string>

  alertSearch?: Maybe<AlertSearchInput>
}
