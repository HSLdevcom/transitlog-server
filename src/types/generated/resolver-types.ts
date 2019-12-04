import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql'
export type Maybe<T> = T | null
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>
export type RequireFields<T, K extends keyof T> = { [X in Exclude<keyof T, K>]?: T[X] } &
  { [P in K]-?: NonNullable<T[P]> }
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string
  String: string
  Boolean: boolean
  Int: number
  Float: number
  /** A DateTime string in ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ). Timezone will be converted to Europe/Helsinki. */
  DateTime: any
  /** A Date string in YYYY-MM-DD format. The timezone is assumed to be Europe/Helsinki. */
  Date: any
  /** The direction of a route. An integer of either 1 or 2. */
  Direction: any
  /** Time is seconds from 00:00:00 in format HH:mm:ss. The hours value can be more than 23. The timezone is assumed to be Europe/Helsinki */
  Time: any
  /** A string that uniquely identifies a vehicle. The format is [operator ID]/[vehicle ID]. The operator ID is padded to have a length of 4 characters. */
  VehicleId: any
  /** A string that defines a bounding box. The coordinates should be in the format `minLng,maxLat,maxLng,minLat` which is compatible with what Leaflet's LatLngBounds.toBBoxString() returns. The precise bbox is not rounded. */
  PreciseBBox: any
  /** A string that defines a bounding box. The coordinates should be in the format `minLng,maxLat,maxLng,minLat` which is compatible with what Leaflet's LatLngBounds.toBBoxString() returns. Toe coordinates will be rounded, use PreciseBBox if this is not desired. */
  BBox: any
  /** The `Upload` scalar type represents a file upload. */
  Upload: any
}

export type Alert = {
  __typename?: 'Alert'
  affectedId: Scalars['String']
  category: AlertCategory
  description: Scalars['String']
  distribution: AlertDistribution
  endDateTime: Scalars['DateTime']
  id: Scalars['String']
  impact: AlertImpact
  lastModifiedDateTime: Scalars['DateTime']
  level: AlertLevel
  startDateTime: Scalars['DateTime']
  title: Scalars['String']
  url?: Maybe<Scalars['String']>
}

export enum AlertCategory {
  Accident = 'ACCIDENT',
  Assault = 'ASSAULT',
  Disturbance = 'DISTURBANCE',
  EarlierDisruption = 'EARLIER_DISRUPTION',
  Hidden = 'HIDDEN',
  ItsSystemError = 'ITS_SYSTEM_ERROR',
  MedicalIncident = 'MEDICAL_INCIDENT',
  MisparkedVehicle = 'MISPARKED_VEHICLE',
  NoDriver = 'NO_DRIVER',
  NoTrafficDisruption = 'NO_TRAFFIC_DISRUPTION',
  Other = 'OTHER',
  OtherDriverError = 'OTHER_DRIVER_ERROR',
  PowerFailure = 'POWER_FAILURE',
  PublicEvent = 'PUBLIC_EVENT',
  RoadClosed = 'ROAD_CLOSED',
  RoadMaintenance = 'ROAD_MAINTENANCE',
  RoadTrench = 'ROAD_TRENCH',
  Seizure = 'SEIZURE',
  StaffDeficit = 'STAFF_DEFICIT',
  StateVisit = 'STATE_VISIT',
  Strike = 'STRIKE',
  SwitchFailure = 'SWITCH_FAILURE',
  TechnicalFailure = 'TECHNICAL_FAILURE',
  Test = 'TEST',
  TooManyPassengers = 'TOO_MANY_PASSENGERS',
  TrackBlocked = 'TRACK_BLOCKED',
  TrackMaintenance = 'TRACK_MAINTENANCE',
  TrafficAccident = 'TRAFFIC_ACCIDENT',
  TrafficJam = 'TRAFFIC_JAM',
  VehicleBreakdown = 'VEHICLE_BREAKDOWN',
  VehicleDeficit = 'VEHICLE_DEFICIT',
  VehicleOffTheRoad = 'VEHICLE_OFF_THE_ROAD',
  Weather = 'WEATHER',
  WeatherConditions = 'WEATHER_CONDITIONS',
}

export enum AlertDistribution {
  AllRoutes = 'ALL_ROUTES',
  AllStops = 'ALL_STOPS',
  Network = 'NETWORK',
  Route = 'ROUTE',
  Stop = 'STOP',
}

export enum AlertImpact {
  BicycleStationOutOfOrder = 'BICYCLE_STATION_OUT_OF_ORDER',
  BicycleSystemOutOfOrder = 'BICYCLE_SYSTEM_OUT_OF_ORDER',
  Cancelled = 'CANCELLED',
  Delayed = 'DELAYED',
  DeviatingSchedule = 'DEVIATING_SCHEDULE',
  DisruptionRoute = 'DISRUPTION_ROUTE',
  IrregularDepartures = 'IRREGULAR_DEPARTURES',
  IrregularDeparturesMax_15 = 'IRREGULAR_DEPARTURES_MAX_15',
  IrregularDeparturesMax_30 = 'IRREGULAR_DEPARTURES_MAX_30',
  NoTrafficImpact = 'NO_TRAFFIC_IMPACT',
  Other = 'OTHER',
  PossibleDeviations = 'POSSIBLE_DEVIATIONS',
  PossiblyDelayed = 'POSSIBLY_DELAYED',
  ReducedBicycleParkCapacity = 'REDUCED_BICYCLE_PARK_CAPACITY',
  ReducedTransport = 'REDUCED_TRANSPORT',
  ReturningToNormal = 'RETURNING_TO_NORMAL',
  Unknown = 'UNKNOWN',
  VendingMachineOutOfOrder = 'VENDING_MACHINE_OUT_OF_ORDER',
}

export enum AlertLevel {
  Info = 'INFO',
  Severe = 'SEVERE',
  Warning = 'WARNING',
}

export type AlertSearchInput = {
  all?: Maybe<Scalars['Boolean']>
  allRoutes?: Maybe<Scalars['Boolean']>
  allStops?: Maybe<Scalars['Boolean']>
  network?: Maybe<Scalars['Boolean']>
  route?: Maybe<Scalars['String']>
  stop?: Maybe<Scalars['String']>
}

export type AreaEventsFilterInput = {
  direction?: Maybe<Scalars['Direction']>
  routeId?: Maybe<Scalars['String']>
}

export enum CacheControlScope {
  Private = 'PRIVATE',
  Public = 'PUBLIC',
}

export type Cancellation = {
  __typename?: 'Cancellation'
  cancellationEffect: CancellationEffect
  cancellationType: CancellationType
  category: AlertCategory
  departureDate: Scalars['Date']
  description: Scalars['String']
  direction: Scalars['Direction']
  id: Scalars['Int']
  isCancelled: Scalars['Boolean']
  journeyStartTime: Scalars['Time']
  lastModifiedDateTime: Scalars['DateTime']
  routeId: Scalars['String']
  subCategory: CancellationSubcategory
  title: Scalars['String']
}

export enum CancellationEffect {
  CancelEntireDeparture = 'CANCEL_ENTIRE_DEPARTURE',
  CancelStopsFromEnd = 'CANCEL_STOPS_FROM_END',
  CancelStopsFromMiddle = 'CANCEL_STOPS_FROM_MIDDLE',
  CancelStopsFromStart = 'CANCEL_STOPS_FROM_START',
}

export type CancellationSearchInput = {
  all?: Maybe<Scalars['Boolean']>
  departureTime?: Maybe<Scalars['String']>
  direction?: Maybe<Scalars['Int']>
  latestOnly?: Maybe<Scalars['Boolean']>
  routeId?: Maybe<Scalars['String']>
}

export enum CancellationSubcategory {
  AssaultOnDriver = 'ASSAULT_ON_DRIVER',
  AssaultOnPassenger = 'ASSAULT_ON_PASSENGER',
  AssaultOnVehicle = 'ASSAULT_ON_VEHICLE',
  BreakMalfunction = 'BREAK_MALFUNCTION',
  CongestionCausedByAccident = 'CONGESTION_CAUSED_BY_ACCIDENT',
  CongestionCausedByWeather = 'CONGESTION_CAUSED_BY_WEATHER',
  CongestionReasonUknown = 'CONGESTION_REASON_UKNOWN',
  DeviceError = 'DEVICE_ERROR',
  DoorMalfunction = 'DOOR_MALFUNCTION',
  DriverError = 'DRIVER_ERROR',
  DriverLate = 'DRIVER_LATE',
  DriverSeizure = 'DRIVER_SEIZURE',
  ElectricMalfunction = 'ELECTRIC_MALFUNCTION',
  EngineMalfunction = 'ENGINE_MALFUNCTION',
  FalseAlarm = 'FALSE_ALARM',
  FaultUnknown = 'FAULT_UNKNOWN',
  FluidLeakage = 'FLUID_LEAKAGE',
  Hidden = 'HIDDEN',
  InsufficientCapasity = 'INSUFFICIENT_CAPASITY',
  InsufficientInstructionsByAuthority = 'INSUFFICIENT_INSTRUCTIONS_BY_AUTHORITY',
  InsufficientInstructionsByOperator = 'INSUFFICIENT_INSTRUCTIONS_BY_OPERATOR',
  ItsSystemNotInstalled = 'ITS_SYSTEM_NOT_INSTALLED',
  MissparkedVehicle = 'MISSPARKED_VEHICLE',
  NdOperatorPlanningError = 'ND_OPERATOR_PLANNING_ERROR',
  NoVehicleAvailable = 'NO_VEHICLE_AVAILABLE',
  OperatorDeviceError = 'OPERATOR_DEVICE_ERROR',
  OperatorPersonnelOnStrike = 'OPERATOR_PERSONNEL_ON_STRIKE',
  OppositeFault = 'OPPOSITE_FAULT',
  OtherAssault = 'OTHER_ASSAULT',
  OtherItsError = 'OTHER_ITS_ERROR',
  OtherMalfunction = 'OTHER_MALFUNCTION',
  OtherOperatorReason = 'OTHER_OPERATOR_REASON',
  OtherSeizure = 'OTHER_SEIZURE',
  OtherStrike = 'OTHER_STRIKE',
  OutOfFuel = 'OUT_OF_FUEL',
  OwnFault = 'OWN_FAULT',
  PassedOutPassenger = 'PASSED_OUT_PASSENGER',
  PassengerInjured = 'PASSENGER_INJURED',
  PassengerSeizure = 'PASSENGER_SEIZURE',
  RoadBlocked = 'ROAD_BLOCKED',
  SlipperyTrack = 'SLIPPERY_TRACK',
  StaffShortage = 'STAFF_SHORTAGE',
  StuckCausedBySlippery = 'STUCK_CAUSED_BY_SLIPPERY',
  UndriveableConditions = 'UNDRIVEABLE_CONDITIONS',
  UnknownCause = 'UNKNOWN_CAUSE',
  UserError = 'USER_ERROR',
  VehicleOffTheRoadByDriverError = 'VEHICLE_OFF_THE_ROAD_BY_DRIVER_ERROR',
  VehicleOffTheRoadByOtherReason = 'VEHICLE_OFF_THE_ROAD_BY_OTHER_REASON',
  WrongInformationInDevice = 'WRONG_INFORMATION_IN_DEVICE',
}

export enum CancellationType {
  BlockFirstDepartureLate = 'BLOCK_FIRST_DEPARTURE_LATE',
  CancelDeparture = 'CANCEL_DEPARTURE',
  DeparturedAfterNextJourney = 'DEPARTURED_AFTER_NEXT_JOURNEY',
  Detour = 'DETOUR',
  EarlyDeparture = 'EARLY_DEPARTURE',
  EarlyDepartureFromTimingPoint = 'EARLY_DEPARTURE_FROM_TIMING_POINT',
  LateDeparture = 'LATE_DEPARTURE',
  SkippedStopCalls = 'SKIPPED_STOP_CALLS',
  TisError = 'TIS_ERROR',
}

export type Departure = {
  __typename?: 'Departure'
  alerts: Alert[]
  cancellations: Cancellation[]
  dayType: Scalars['String']
  departureDate: Scalars['Date']
  departureEvent?: Maybe<JourneyStopEvent>
  departureId: Scalars['Int']
  departureTime: Scalars['Time']
  direction: Scalars['Direction']
  equipmentColor?: Maybe<Scalars['String']>
  equipmentIsRequired?: Maybe<Scalars['Boolean']>
  equipmentType?: Maybe<Scalars['String']>
  extraDeparture: Scalars['String']
  id: Scalars['ID']
  index?: Maybe<Scalars['Int']>
  isCancelled: Scalars['Boolean']
  isNextDay: Scalars['Boolean']
  isOrigin?: Maybe<Scalars['Boolean']>
  isTimingStop: Scalars['Boolean']
  journey?: Maybe<DepartureJourney>
  mode: Scalars['String']
  observedArrivalTime?: Maybe<ObservedArrival>
  observedDepartureTime?: Maybe<ObservedDeparture>
  operatorId?: Maybe<Scalars['String']>
  originDepartureTime?: Maybe<PlannedDeparture>
  plannedArrivalTime: PlannedArrival
  plannedDepartureTime: PlannedDeparture
  recoveryTime?: Maybe<Scalars['Int']>
  routeId: Scalars['String']
  stop: Stop
  stopId: Scalars['String']
  terminalTime?: Maybe<Scalars['Int']>
}

export type DepartureFilterInput = {
  direction?: Maybe<Scalars['Direction']>
  maxHour?: Maybe<Scalars['Int']>
  minHour?: Maybe<Scalars['Int']>
  routeId?: Maybe<Scalars['String']>
}

export type DepartureJourney = {
  __typename?: 'DepartureJourney'
  _numInstance?: Maybe<Scalars['Int']>
  alerts: Alert[]
  cancellations: Cancellation[]
  departureDate: Scalars['Date']
  departureTime: Scalars['Time']
  direction?: Maybe<Scalars['Direction']>
  id: Scalars['ID']
  isCancelled: Scalars['Boolean']
  journeyType: Scalars['String']
  mode?: Maybe<Scalars['String']>
  originStopId?: Maybe<Scalars['String']>
  routeId?: Maybe<Scalars['String']>
  type: Scalars['String']
  uniqueVehicleId?: Maybe<Scalars['VehicleId']>
}

export type Equipment = {
  __typename?: 'Equipment'
  _matchScore?: Maybe<Scalars['Float']>
  age?: Maybe<Scalars['Int']>
  emissionClass?: Maybe<Scalars['String']>
  emissionDesc?: Maybe<Scalars['String']>
  exteriorColor?: Maybe<Scalars['String']>
  id: Scalars['ID']
  inService?: Maybe<Scalars['Boolean']>
  operatorId: Scalars['String']
  operatorName?: Maybe<Scalars['String']>
  registryNr?: Maybe<Scalars['String']>
  type?: Maybe<Scalars['String']>
  vehicleId: Scalars['String']
}

export type EquipmentFilterInput = {
  operatorId?: Maybe<Scalars['String']>
  search?: Maybe<Scalars['String']>
  vehicleId?: Maybe<Scalars['String']>
}

export type ExceptionDay = {
  __typename?: 'ExceptionDay'
  dayType: Scalars['String']
  description?: Maybe<Scalars['String']>
  effectiveDayTypes: Array<Scalars['String']>
  endTime?: Maybe<Scalars['Time']>
  exceptionDate: Scalars['Date']
  exclusive: Scalars['Boolean']
  id: Scalars['ID']
  modeScope: Scalars['String']
  scope: Scalars['String']
  scopedDayType: Scalars['String']
  startTime?: Maybe<Scalars['Time']>
}

export type Journey = {
  __typename?: 'Journey'
  alerts: Alert[]
  cancellations: Cancellation[]
  departure?: Maybe<Departure>
  departureDate: Scalars['Date']
  departureTime?: Maybe<Scalars['Time']>
  direction?: Maybe<Scalars['Direction']>
  equipment?: Maybe<Equipment>
  events: JourneyEventType[]
  headsign?: Maybe<Scalars['String']>
  id: Scalars['ID']
  isCancelled: Scalars['Boolean']
  journeyDurationMinutes?: Maybe<Scalars['Int']>
  journeyLength?: Maybe<Scalars['Int']>
  journeyType: Scalars['String']
  mode?: Maybe<Scalars['String']>
  name?: Maybe<Scalars['String']>
  operatorId?: Maybe<Scalars['String']>
  originStopId?: Maybe<Scalars['String']>
  routeDepartures?: Maybe<Departure[]>
  routeId?: Maybe<Scalars['String']>
  uniqueVehicleId?: Maybe<Scalars['VehicleId']>
  vehicleId?: Maybe<Scalars['String']>
  vehiclePositions: VehiclePosition[]
}

export type JourneyCancellationEvent = {
  __typename?: 'JourneyCancellationEvent'
  cancellationEffect: CancellationEffect
  cancellationType: CancellationType
  category: AlertCategory
  description: Scalars['String']
  id: Scalars['ID']
  isCancelled: Scalars['Boolean']
  plannedDate?: Maybe<Scalars['Date']>
  plannedTime?: Maybe<Scalars['Time']>
  recordedAt: Scalars['DateTime']
  recordedAtUnix: Scalars['Int']
  recordedTime: Scalars['Time']
  subCategory: CancellationSubcategory
  title: Scalars['String']
  type: Scalars['String']
}

export type JourneyEvent = {
  __typename?: 'JourneyEvent'
  _isVirtual?: Maybe<Scalars['Boolean']>
  id: Scalars['ID']
  lat?: Maybe<Scalars['Float']>
  lng?: Maybe<Scalars['Float']>
  receivedAt: Scalars['DateTime']
  recordedAt: Scalars['DateTime']
  recordedAtUnix: Scalars['Int']
  recordedTime: Scalars['Time']
  stopId?: Maybe<Scalars['String']>
  type: Scalars['String']
}

export type JourneyEventType =
  | JourneyCancellationEvent
  | JourneyEvent
  | JourneyStopEvent
  | PlannedStopEvent

export type JourneyStopEvent = {
  __typename?: 'JourneyStopEvent'
  _isVirtual?: Maybe<Scalars['Boolean']>
  departureId?: Maybe<Scalars['Int']>
  doorsOpened?: Maybe<Scalars['Boolean']>
  id: Scalars['ID']
  index?: Maybe<Scalars['Int']>
  isNextDay?: Maybe<Scalars['Boolean']>
  isOrigin?: Maybe<Scalars['Boolean']>
  isTimingStop: Scalars['Boolean']
  lat?: Maybe<Scalars['Float']>
  lng?: Maybe<Scalars['Float']>
  nextStopId: Scalars['String']
  plannedDate?: Maybe<Scalars['Date']>
  plannedDateTime?: Maybe<Scalars['DateTime']>
  plannedTime?: Maybe<Scalars['Time']>
  plannedTimeDifference?: Maybe<Scalars['Int']>
  plannedUnix?: Maybe<Scalars['Int']>
  receivedAt: Scalars['DateTime']
  recordedAt: Scalars['DateTime']
  recordedAtUnix: Scalars['Int']
  recordedTime: Scalars['Time']
  stop?: Maybe<Stop>
  stopId?: Maybe<Scalars['String']>
  stopped?: Maybe<Scalars['Boolean']>
  type: Scalars['String']
  unplannedStop: Scalars['Boolean']
}

export type ObservedArrival = {
  __typename?: 'ObservedArrival'
  arrivalDate: Scalars['Date']
  arrivalDateTime: Scalars['DateTime']
  arrivalTime: Scalars['Time']
  arrivalTimeDifference: Scalars['Int']
  id: Scalars['ID']
}

export type ObservedDeparture = {
  __typename?: 'ObservedDeparture'
  departureDate: Scalars['Date']
  departureDateTime: Scalars['DateTime']
  departureTime: Scalars['Time']
  departureTimeDifference: Scalars['Int']
  id: Scalars['ID']
}

export type PlannedArrival = {
  __typename?: 'PlannedArrival'
  arrivalDate: Scalars['Date']
  arrivalDateTime: Scalars['DateTime']
  arrivalTime: Scalars['Time']
  id: Scalars['ID']
  isNextDay?: Maybe<Scalars['Boolean']>
}

export type PlannedDeparture = {
  __typename?: 'PlannedDeparture'
  departureDate: Scalars['Date']
  departureDateTime: Scalars['DateTime']
  departureTime: Scalars['Time']
  id: Scalars['ID']
  isNextDay?: Maybe<Scalars['Boolean']>
}

export type PlannedStopEvent = {
  __typename?: 'PlannedStopEvent'
  departureId?: Maybe<Scalars['Int']>
  id: Scalars['ID']
  index?: Maybe<Scalars['Int']>
  isNextDay?: Maybe<Scalars['Boolean']>
  isOrigin?: Maybe<Scalars['Boolean']>
  isTimingStop: Scalars['Boolean']
  plannedDate?: Maybe<Scalars['Date']>
  plannedDateTime?: Maybe<Scalars['DateTime']>
  plannedTime?: Maybe<Scalars['Time']>
  plannedUnix?: Maybe<Scalars['Int']>
  stop?: Maybe<Stop>
  stopId?: Maybe<Scalars['String']>
  type: Scalars['String']
}

/** Any object that describes something with a position implements this interface. */
export type Position = {
  lat?: Maybe<Scalars['Float']>
  lng?: Maybe<Scalars['Float']>
}

export type Query = {
  __typename?: 'Query'
  alerts: Alert[]
  cancellations: Cancellation[]
  departures: Array<Maybe<Departure>>
  equipment: Array<Maybe<Equipment>>
  exceptionDays: Array<Maybe<ExceptionDay>>
  journey?: Maybe<Journey>
  journeys: Array<Maybe<Journey>>
  journeysByBbox: Array<Maybe<Journey>>
  route?: Maybe<Route>
  routeDepartures: Array<Maybe<Departure>>
  routeGeometry?: Maybe<RouteGeometry>
  routeSegments: Array<Maybe<RouteSegment>>
  routes: Array<Maybe<Route>>
  stop?: Maybe<Stop>
  stops: Array<Maybe<Stop>>
  uiMessage: UiMessage
  unsignedVehicleEvents: Array<Maybe<VehiclePosition>>
  vehicleJourneys: Array<Maybe<VehicleJourney>>
  weeklyDepartures: Array<Maybe<Departure>>
}

export type QueryAlertsArgs = {
  alertSearch?: Maybe<AlertSearchInput>
  language: Scalars['String']
  time?: Maybe<Scalars['String']>
}

export type QueryCancellationsArgs = {
  cancellationSearch?: Maybe<CancellationSearchInput>
  date?: Maybe<Scalars['Date']>
}

export type QueryDeparturesArgs = {
  date: Scalars['Date']
  filter?: Maybe<DepartureFilterInput>
  stopId: Scalars['String']
}

export type QueryEquipmentArgs = {
  date?: Maybe<Scalars['Date']>
  filter?: Maybe<EquipmentFilterInput>
}

export type QueryExceptionDaysArgs = {
  year: Scalars['String']
}

export type QueryJourneyArgs = {
  departureDate: Scalars['Date']
  departureTime: Scalars['Time']
  direction: Scalars['Direction']
  routeId: Scalars['String']
  uniqueVehicleId?: Maybe<Scalars['VehicleId']>
  unsignedEvents?: Maybe<Scalars['Boolean']>
}

export type QueryJourneysArgs = {
  departureDate: Scalars['Date']
  direction: Scalars['Direction']
  routeId: Scalars['String']
}

export type QueryJourneysByBboxArgs = {
  bbox: Scalars['PreciseBBox']
  date: Scalars['Date']
  filters?: Maybe<AreaEventsFilterInput>
  maxTime: Scalars['DateTime']
  minTime: Scalars['DateTime']
  unsignedEvents?: Maybe<Scalars['Boolean']>
}

export type QueryRouteArgs = {
  date: Scalars['Date']
  direction: Scalars['Direction']
  routeId: Scalars['String']
}

export type QueryRouteDeparturesArgs = {
  date: Scalars['Date']
  direction: Scalars['Direction']
  routeId: Scalars['String']
  stopId: Scalars['String']
}

export type QueryRouteGeometryArgs = {
  date: Scalars['Date']
  direction: Scalars['Direction']
  routeId: Scalars['String']
}

export type QueryRouteSegmentsArgs = {
  date: Scalars['Date']
  direction: Scalars['Direction']
  routeId: Scalars['String']
}

export type QueryRoutesArgs = {
  date?: Maybe<Scalars['Date']>
  filter?: Maybe<RouteFilterInput>
}

export type QueryStopArgs = {
  date: Scalars['Date']
  stopId: Scalars['String']
}

export type QueryStopsArgs = {
  date?: Maybe<Scalars['Date']>
  filter?: Maybe<StopFilterInput>
}

export type QueryUnsignedVehicleEventsArgs = {
  date: Scalars['Date']
  uniqueVehicleId: Scalars['VehicleId']
}

export type QueryVehicleJourneysArgs = {
  date: Scalars['Date']
  uniqueVehicleId: Scalars['VehicleId']
  unsignedEvents?: Maybe<Scalars['Boolean']>
}

export type QueryWeeklyDeparturesArgs = {
  date: Scalars['Date']
  direction: Scalars['Direction']
  lastStopArrival?: Maybe<Scalars['Boolean']>
  routeId: Scalars['String']
  stopId: Scalars['String']
}

export type Route = {
  __typename?: 'Route'
  _matchScore?: Maybe<Scalars['Float']>
  alerts: Alert[]
  cancellations: Cancellation[]
  destination?: Maybe<Scalars['String']>
  destinationStopId?: Maybe<Scalars['String']>
  direction: Scalars['Direction']
  id: Scalars['ID']
  mode?: Maybe<Scalars['String']>
  name?: Maybe<Scalars['String']>
  origin?: Maybe<Scalars['String']>
  originStopId: Scalars['String']
  routeDurationMinutes?: Maybe<Scalars['Int']>
  routeId: Scalars['String']
  routeLength?: Maybe<Scalars['Int']>
}

export type RouteFilterInput = {
  direction?: Maybe<Scalars['Direction']>
  routeId?: Maybe<Scalars['String']>
  search?: Maybe<Scalars['String']>
}

export type RouteGeometry = {
  __typename?: 'RouteGeometry'
  coordinates: RouteGeometryPoint[]
  id: Scalars['ID']
  mode?: Maybe<Scalars['String']>
}

export type RouteGeometryPoint = Position & {
  __typename?: 'RouteGeometryPoint'
  lat: Scalars['Float']
  lng: Scalars['Float']
}

export type RouteSegment = Position & {
  __typename?: 'RouteSegment'
  alerts: Alert[]
  cancellations: Cancellation[]
  destination: Scalars['String']
  direction: Scalars['Direction']
  distanceFromPrevious?: Maybe<Scalars['Int']>
  distanceFromStart?: Maybe<Scalars['Int']>
  duration?: Maybe<Scalars['Int']>
  id: Scalars['ID']
  isTimingStop: Scalars['Boolean']
  lat: Scalars['Float']
  lng: Scalars['Float']
  modes?: Maybe<Array<Scalars['String']>>
  name?: Maybe<Scalars['String']>
  originStopId?: Maybe<Scalars['String']>
  radius?: Maybe<Scalars['Float']>
  routeId: Scalars['String']
  shortId: Scalars['String']
  stopId: Scalars['String']
  stopIndex: Scalars['Int']
}

export type Stop = Position & {
  __typename?: 'Stop'
  _matchScore?: Maybe<Scalars['Float']>
  alerts: Alert[]
  id: Scalars['ID']
  isTimingStop: Scalars['Boolean']
  lat: Scalars['Float']
  lng: Scalars['Float']
  modes: Array<Maybe<Scalars['String']>>
  name?: Maybe<Scalars['String']>
  radius?: Maybe<Scalars['Float']>
  routes: StopRoute[]
  shortId: Scalars['String']
  stopId: Scalars['String']
  stopIndex?: Maybe<Scalars['Int']>
}

export type StopFilterInput = {
  search?: Maybe<Scalars['String']>
}

export type StopRoute = {
  __typename?: 'StopRoute'
  direction: Scalars['Direction']
  id: Scalars['ID']
  isTimingStop: Scalars['Boolean']
  mode?: Maybe<Scalars['String']>
  originStopId?: Maybe<Scalars['String']>
  routeId: Scalars['String']
}

export type UiMessage = {
  __typename?: 'UIMessage'
  date?: Maybe<Scalars['String']>
  message?: Maybe<Scalars['String']>
}

export type VehicleJourney = {
  __typename?: 'VehicleJourney'
  alerts: Alert[]
  cancellations: Cancellation[]
  departureDate: Scalars['Date']
  departureTime: Scalars['Time']
  direction?: Maybe<Scalars['Direction']>
  headsign?: Maybe<Scalars['String']>
  id: Scalars['ID']
  isCancelled: Scalars['Boolean']
  journeyType: Scalars['String']
  mode?: Maybe<Scalars['String']>
  operatorId?: Maybe<Scalars['String']>
  recordedAt: Scalars['DateTime']
  recordedAtUnix: Scalars['Int']
  recordedTime: Scalars['Time']
  routeId?: Maybe<Scalars['String']>
  timeDifference: Scalars['Int']
  uniqueVehicleId?: Maybe<Scalars['VehicleId']>
  vehicleId?: Maybe<Scalars['String']>
}

export type VehiclePosition = Position & {
  __typename?: 'VehiclePosition'
  delay?: Maybe<Scalars['Int']>
  doorStatus?: Maybe<Scalars['Boolean']>
  heading?: Maybe<Scalars['Int']>
  id: Scalars['ID']
  journeyType: Scalars['String']
  lat?: Maybe<Scalars['Float']>
  lng?: Maybe<Scalars['Float']>
  mode?: Maybe<Scalars['String']>
  nextStopId?: Maybe<Scalars['String']>
  operatorId?: Maybe<Scalars['String']>
  receivedAt: Scalars['DateTime']
  recordedAt: Scalars['DateTime']
  recordedAtUnix: Scalars['Int']
  recordedTime: Scalars['Time']
  stop?: Maybe<Scalars['String']>
  uniqueVehicleId?: Maybe<Scalars['VehicleId']>
  vehicleId?: Maybe<Scalars['String']>
  velocity?: Maybe<Scalars['Float']>
}

export type ResolverTypeWrapper<T> = Promise<T> | T

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult

export type StitchingResolver<TResult, TParent, TContext, TArgs> = {
  fragment: string
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>
}

export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
  | ResolverFn<TResult, TParent, TContext, TArgs>
  | StitchingResolver<TResult, TParent, TContext, TArgs>

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterator<TResult> | Promise<AsyncIterator<TResult>>

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>

export interface SubscriptionSubscriberObject<
  TResult,
  TKey extends string,
  TParent,
  TContext,
  TArgs
> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>

export type SubscriptionResolver<
  TResult,
  TKey extends string,
  TParent = {},
  TContext = {},
  TArgs = {}
> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes>

export type NextResolverFn<T> = () => Promise<T>

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Query: ResolverTypeWrapper<{}>
  AlertSearchInput: AlertSearchInput
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>
  String: ResolverTypeWrapper<Scalars['String']>
  Alert: ResolverTypeWrapper<Alert>
  AlertCategory: AlertCategory
  AlertDistribution: AlertDistribution
  DateTime: ResolverTypeWrapper<Scalars['DateTime']>
  AlertImpact: AlertImpact
  AlertLevel: AlertLevel
  CancellationSearchInput: CancellationSearchInput
  Int: ResolverTypeWrapper<Scalars['Int']>
  Date: ResolverTypeWrapper<Scalars['Date']>
  Cancellation: ResolverTypeWrapper<Cancellation>
  CancellationEffect: CancellationEffect
  CancellationType: CancellationType
  Direction: ResolverTypeWrapper<Scalars['Direction']>
  Time: ResolverTypeWrapper<Scalars['Time']>
  CancellationSubcategory: CancellationSubcategory
  DepartureFilterInput: DepartureFilterInput
  Departure: ResolverTypeWrapper<Departure>
  JourneyStopEvent: ResolverTypeWrapper<JourneyStopEvent>
  ID: ResolverTypeWrapper<Scalars['ID']>
  Float: ResolverTypeWrapper<Scalars['Float']>
  Stop: ResolverTypeWrapper<Stop>
  Position: ResolverTypeWrapper<Position>
  StopRoute: ResolverTypeWrapper<StopRoute>
  DepartureJourney: ResolverTypeWrapper<DepartureJourney>
  VehicleId: ResolverTypeWrapper<Scalars['VehicleId']>
  ObservedArrival: ResolverTypeWrapper<ObservedArrival>
  ObservedDeparture: ResolverTypeWrapper<ObservedDeparture>
  PlannedDeparture: ResolverTypeWrapper<PlannedDeparture>
  PlannedArrival: ResolverTypeWrapper<PlannedArrival>
  EquipmentFilterInput: EquipmentFilterInput
  Equipment: ResolverTypeWrapper<Equipment>
  ExceptionDay: ResolverTypeWrapper<ExceptionDay>
  Journey: ResolverTypeWrapper<
    Omit<Journey, 'events'> & { events: Array<ResolversTypes['JourneyEventType']> }
  >
  JourneyEventType:
    | ResolversTypes['JourneyCancellationEvent']
    | ResolversTypes['JourneyEvent']
    | ResolversTypes['JourneyStopEvent']
    | ResolversTypes['PlannedStopEvent']
  JourneyCancellationEvent: ResolverTypeWrapper<JourneyCancellationEvent>
  JourneyEvent: ResolverTypeWrapper<JourneyEvent>
  PlannedStopEvent: ResolverTypeWrapper<PlannedStopEvent>
  VehiclePosition: ResolverTypeWrapper<VehiclePosition>
  PreciseBBox: ResolverTypeWrapper<Scalars['PreciseBBox']>
  AreaEventsFilterInput: AreaEventsFilterInput
  Route: ResolverTypeWrapper<Route>
  RouteGeometry: ResolverTypeWrapper<RouteGeometry>
  RouteGeometryPoint: ResolverTypeWrapper<RouteGeometryPoint>
  RouteSegment: ResolverTypeWrapper<RouteSegment>
  RouteFilterInput: RouteFilterInput
  StopFilterInput: StopFilterInput
  UIMessage: ResolverTypeWrapper<UiMessage>
  VehicleJourney: ResolverTypeWrapper<VehicleJourney>
  CacheControlScope: CacheControlScope
  BBox: ResolverTypeWrapper<Scalars['BBox']>
  Upload: ResolverTypeWrapper<Scalars['Upload']>
}

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Query: {}
  AlertSearchInput: AlertSearchInput
  Boolean: Scalars['Boolean']
  String: Scalars['String']
  Alert: Alert
  AlertCategory: AlertCategory
  AlertDistribution: AlertDistribution
  DateTime: Scalars['DateTime']
  AlertImpact: AlertImpact
  AlertLevel: AlertLevel
  CancellationSearchInput: CancellationSearchInput
  Int: Scalars['Int']
  Date: Scalars['Date']
  Cancellation: Cancellation
  CancellationEffect: CancellationEffect
  CancellationType: CancellationType
  Direction: Scalars['Direction']
  Time: Scalars['Time']
  CancellationSubcategory: CancellationSubcategory
  DepartureFilterInput: DepartureFilterInput
  Departure: Departure
  JourneyStopEvent: JourneyStopEvent
  ID: Scalars['ID']
  Float: Scalars['Float']
  Stop: Stop
  Position: Position
  StopRoute: StopRoute
  DepartureJourney: DepartureJourney
  VehicleId: Scalars['VehicleId']
  ObservedArrival: ObservedArrival
  ObservedDeparture: ObservedDeparture
  PlannedDeparture: PlannedDeparture
  PlannedArrival: PlannedArrival
  EquipmentFilterInput: EquipmentFilterInput
  Equipment: Equipment
  ExceptionDay: ExceptionDay
  Journey: Omit<Journey, 'events'> & {
    events: Array<ResolversParentTypes['JourneyEventType']>
  }
  JourneyEventType:
    | ResolversParentTypes['JourneyCancellationEvent']
    | ResolversParentTypes['JourneyEvent']
    | ResolversParentTypes['JourneyStopEvent']
    | ResolversParentTypes['PlannedStopEvent']
  JourneyCancellationEvent: JourneyCancellationEvent
  JourneyEvent: JourneyEvent
  PlannedStopEvent: PlannedStopEvent
  VehiclePosition: VehiclePosition
  PreciseBBox: Scalars['PreciseBBox']
  AreaEventsFilterInput: AreaEventsFilterInput
  Route: Route
  RouteGeometry: RouteGeometry
  RouteGeometryPoint: RouteGeometryPoint
  RouteSegment: RouteSegment
  RouteFilterInput: RouteFilterInput
  StopFilterInput: StopFilterInput
  UIMessage: UiMessage
  VehicleJourney: VehicleJourney
  CacheControlScope: CacheControlScope
  BBox: Scalars['BBox']
  Upload: Scalars['Upload']
}

export type AlertResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['Alert'] = ResolversParentTypes['Alert']
> = {
  affectedId?: Resolver<ResolversTypes['String'], ParentType, ContextType>
  category?: Resolver<ResolversTypes['AlertCategory'], ParentType, ContextType>
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>
  distribution?: Resolver<ResolversTypes['AlertDistribution'], ParentType, ContextType>
  endDateTime?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>
  impact?: Resolver<ResolversTypes['AlertImpact'], ParentType, ContextType>
  lastModifiedDateTime?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>
  level?: Resolver<ResolversTypes['AlertLevel'], ParentType, ContextType>
  startDateTime?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>
  url?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
}

export interface BBoxScalarConfig
  extends GraphQLScalarTypeConfig<ResolversTypes['BBox'], any> {
  name: 'BBox'
}

export type CancellationResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['Cancellation'] = ResolversParentTypes['Cancellation']
> = {
  cancellationEffect?: Resolver<ResolversTypes['CancellationEffect'], ParentType, ContextType>
  cancellationType?: Resolver<ResolversTypes['CancellationType'], ParentType, ContextType>
  category?: Resolver<ResolversTypes['AlertCategory'], ParentType, ContextType>
  departureDate?: Resolver<ResolversTypes['Date'], ParentType, ContextType>
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>
  direction?: Resolver<ResolversTypes['Direction'], ParentType, ContextType>
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>
  isCancelled?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>
  journeyStartTime?: Resolver<ResolversTypes['Time'], ParentType, ContextType>
  lastModifiedDateTime?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>
  routeId?: Resolver<ResolversTypes['String'], ParentType, ContextType>
  subCategory?: Resolver<ResolversTypes['CancellationSubcategory'], ParentType, ContextType>
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>
}

export interface DateScalarConfig
  extends GraphQLScalarTypeConfig<ResolversTypes['Date'], any> {
  name: 'Date'
}

export interface DateTimeScalarConfig
  extends GraphQLScalarTypeConfig<ResolversTypes['DateTime'], any> {
  name: 'DateTime'
}

export type DepartureResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['Departure'] = ResolversParentTypes['Departure']
> = {
  alerts?: Resolver<Array<ResolversTypes['Alert']>, ParentType, ContextType>
  cancellations?: Resolver<Array<ResolversTypes['Cancellation']>, ParentType, ContextType>
  dayType?: Resolver<ResolversTypes['String'], ParentType, ContextType>
  departureDate?: Resolver<ResolversTypes['Date'], ParentType, ContextType>
  departureEvent?: Resolver<Maybe<ResolversTypes['JourneyStopEvent']>, ParentType, ContextType>
  departureId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>
  departureTime?: Resolver<ResolversTypes['Time'], ParentType, ContextType>
  direction?: Resolver<ResolversTypes['Direction'], ParentType, ContextType>
  equipmentColor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
  equipmentIsRequired?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>
  equipmentType?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
  extraDeparture?: Resolver<ResolversTypes['String'], ParentType, ContextType>
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>
  index?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>
  isCancelled?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>
  isNextDay?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>
  isOrigin?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>
  isTimingStop?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>
  journey?: Resolver<Maybe<ResolversTypes['DepartureJourney']>, ParentType, ContextType>
  mode?: Resolver<ResolversTypes['String'], ParentType, ContextType>
  observedArrivalTime?: Resolver<
    Maybe<ResolversTypes['ObservedArrival']>,
    ParentType,
    ContextType
  >
  observedDepartureTime?: Resolver<
    Maybe<ResolversTypes['ObservedDeparture']>,
    ParentType,
    ContextType
  >
  operatorId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
  originDepartureTime?: Resolver<
    Maybe<ResolversTypes['PlannedDeparture']>,
    ParentType,
    ContextType
  >
  plannedArrivalTime?: Resolver<ResolversTypes['PlannedArrival'], ParentType, ContextType>
  plannedDepartureTime?: Resolver<ResolversTypes['PlannedDeparture'], ParentType, ContextType>
  recoveryTime?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>
  routeId?: Resolver<ResolversTypes['String'], ParentType, ContextType>
  stop?: Resolver<ResolversTypes['Stop'], ParentType, ContextType>
  stopId?: Resolver<ResolversTypes['String'], ParentType, ContextType>
  terminalTime?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>
}

export type DepartureJourneyResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['DepartureJourney'] = ResolversParentTypes['DepartureJourney']
> = {
  _numInstance?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>
  alerts?: Resolver<Array<ResolversTypes['Alert']>, ParentType, ContextType>
  cancellations?: Resolver<Array<ResolversTypes['Cancellation']>, ParentType, ContextType>
  departureDate?: Resolver<ResolversTypes['Date'], ParentType, ContextType>
  departureTime?: Resolver<ResolversTypes['Time'], ParentType, ContextType>
  direction?: Resolver<Maybe<ResolversTypes['Direction']>, ParentType, ContextType>
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>
  isCancelled?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>
  journeyType?: Resolver<ResolversTypes['String'], ParentType, ContextType>
  mode?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
  originStopId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
  routeId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>
  uniqueVehicleId?: Resolver<Maybe<ResolversTypes['VehicleId']>, ParentType, ContextType>
}

export interface DirectionScalarConfig
  extends GraphQLScalarTypeConfig<ResolversTypes['Direction'], any> {
  name: 'Direction'
}

export type EquipmentResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['Equipment'] = ResolversParentTypes['Equipment']
> = {
  _matchScore?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>
  age?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>
  emissionClass?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
  emissionDesc?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
  exteriorColor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>
  inService?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>
  operatorId?: Resolver<ResolversTypes['String'], ParentType, ContextType>
  operatorName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
  registryNr?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
  type?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
  vehicleId?: Resolver<ResolversTypes['String'], ParentType, ContextType>
}

export type ExceptionDayResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['ExceptionDay'] = ResolversParentTypes['ExceptionDay']
> = {
  dayType?: Resolver<ResolversTypes['String'], ParentType, ContextType>
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
  effectiveDayTypes?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>
  endTime?: Resolver<Maybe<ResolversTypes['Time']>, ParentType, ContextType>
  exceptionDate?: Resolver<ResolversTypes['Date'], ParentType, ContextType>
  exclusive?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>
  modeScope?: Resolver<ResolversTypes['String'], ParentType, ContextType>
  scope?: Resolver<ResolversTypes['String'], ParentType, ContextType>
  scopedDayType?: Resolver<ResolversTypes['String'], ParentType, ContextType>
  startTime?: Resolver<Maybe<ResolversTypes['Time']>, ParentType, ContextType>
}

export type JourneyResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['Journey'] = ResolversParentTypes['Journey']
> = {
  alerts?: Resolver<Array<ResolversTypes['Alert']>, ParentType, ContextType>
  cancellations?: Resolver<Array<ResolversTypes['Cancellation']>, ParentType, ContextType>
  departure?: Resolver<Maybe<ResolversTypes['Departure']>, ParentType, ContextType>
  departureDate?: Resolver<ResolversTypes['Date'], ParentType, ContextType>
  departureTime?: Resolver<Maybe<ResolversTypes['Time']>, ParentType, ContextType>
  direction?: Resolver<Maybe<ResolversTypes['Direction']>, ParentType, ContextType>
  equipment?: Resolver<Maybe<ResolversTypes['Equipment']>, ParentType, ContextType>
  events?: Resolver<Array<ResolversTypes['JourneyEventType']>, ParentType, ContextType>
  headsign?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>
  isCancelled?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>
  journeyDurationMinutes?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>
  journeyLength?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>
  journeyType?: Resolver<ResolversTypes['String'], ParentType, ContextType>
  mode?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
  operatorId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
  originStopId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
  routeDepartures?: Resolver<
    Maybe<Array<ResolversTypes['Departure']>>,
    ParentType,
    ContextType
  >
  routeId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
  uniqueVehicleId?: Resolver<Maybe<ResolversTypes['VehicleId']>, ParentType, ContextType>
  vehicleId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
  vehiclePositions?: Resolver<
    Array<ResolversTypes['VehiclePosition']>,
    ParentType,
    ContextType
  >
}

export type JourneyCancellationEventResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['JourneyCancellationEvent'] = ResolversParentTypes['JourneyCancellationEvent']
> = {
  cancellationEffect?: Resolver<ResolversTypes['CancellationEffect'], ParentType, ContextType>
  cancellationType?: Resolver<ResolversTypes['CancellationType'], ParentType, ContextType>
  category?: Resolver<ResolversTypes['AlertCategory'], ParentType, ContextType>
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>
  isCancelled?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>
  plannedDate?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>
  plannedTime?: Resolver<Maybe<ResolversTypes['Time']>, ParentType, ContextType>
  recordedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>
  recordedAtUnix?: Resolver<ResolversTypes['Int'], ParentType, ContextType>
  recordedTime?: Resolver<ResolversTypes['Time'], ParentType, ContextType>
  subCategory?: Resolver<ResolversTypes['CancellationSubcategory'], ParentType, ContextType>
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>
}

export type JourneyEventResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['JourneyEvent'] = ResolversParentTypes['JourneyEvent']
> = {
  _isVirtual?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>
  lat?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>
  lng?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>
  receivedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>
  recordedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>
  recordedAtUnix?: Resolver<ResolversTypes['Int'], ParentType, ContextType>
  recordedTime?: Resolver<ResolversTypes['Time'], ParentType, ContextType>
  stopId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>
}

export type JourneyEventTypeResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['JourneyEventType'] = ResolversParentTypes['JourneyEventType']
> = {
  __resolveType: TypeResolveFn<
    'JourneyCancellationEvent' | 'JourneyEvent' | 'JourneyStopEvent' | 'PlannedStopEvent',
    ParentType,
    ContextType
  >
}

export type JourneyStopEventResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['JourneyStopEvent'] = ResolversParentTypes['JourneyStopEvent']
> = {
  _isVirtual?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>
  departureId?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>
  doorsOpened?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>
  index?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>
  isNextDay?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>
  isOrigin?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>
  isTimingStop?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>
  lat?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>
  lng?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>
  nextStopId?: Resolver<ResolversTypes['String'], ParentType, ContextType>
  plannedDate?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>
  plannedDateTime?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>
  plannedTime?: Resolver<Maybe<ResolversTypes['Time']>, ParentType, ContextType>
  plannedTimeDifference?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>
  plannedUnix?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>
  receivedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>
  recordedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>
  recordedAtUnix?: Resolver<ResolversTypes['Int'], ParentType, ContextType>
  recordedTime?: Resolver<ResolversTypes['Time'], ParentType, ContextType>
  stop?: Resolver<Maybe<ResolversTypes['Stop']>, ParentType, ContextType>
  stopId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
  stopped?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>
  unplannedStop?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>
}

export type ObservedArrivalResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['ObservedArrival'] = ResolversParentTypes['ObservedArrival']
> = {
  arrivalDate?: Resolver<ResolversTypes['Date'], ParentType, ContextType>
  arrivalDateTime?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>
  arrivalTime?: Resolver<ResolversTypes['Time'], ParentType, ContextType>
  arrivalTimeDifference?: Resolver<ResolversTypes['Int'], ParentType, ContextType>
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>
}

export type ObservedDepartureResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['ObservedDeparture'] = ResolversParentTypes['ObservedDeparture']
> = {
  departureDate?: Resolver<ResolversTypes['Date'], ParentType, ContextType>
  departureDateTime?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>
  departureTime?: Resolver<ResolversTypes['Time'], ParentType, ContextType>
  departureTimeDifference?: Resolver<ResolversTypes['Int'], ParentType, ContextType>
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>
}

export type PlannedArrivalResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['PlannedArrival'] = ResolversParentTypes['PlannedArrival']
> = {
  arrivalDate?: Resolver<ResolversTypes['Date'], ParentType, ContextType>
  arrivalDateTime?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>
  arrivalTime?: Resolver<ResolversTypes['Time'], ParentType, ContextType>
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>
  isNextDay?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>
}

export type PlannedDepartureResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['PlannedDeparture'] = ResolversParentTypes['PlannedDeparture']
> = {
  departureDate?: Resolver<ResolversTypes['Date'], ParentType, ContextType>
  departureDateTime?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>
  departureTime?: Resolver<ResolversTypes['Time'], ParentType, ContextType>
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>
  isNextDay?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>
}

export type PlannedStopEventResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['PlannedStopEvent'] = ResolversParentTypes['PlannedStopEvent']
> = {
  departureId?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>
  index?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>
  isNextDay?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>
  isOrigin?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>
  isTimingStop?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>
  plannedDate?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>
  plannedDateTime?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>
  plannedTime?: Resolver<Maybe<ResolversTypes['Time']>, ParentType, ContextType>
  plannedUnix?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>
  stop?: Resolver<Maybe<ResolversTypes['Stop']>, ParentType, ContextType>
  stopId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>
}

export type PositionResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['Position'] = ResolversParentTypes['Position']
> = {
  __resolveType: TypeResolveFn<
    'Stop' | 'VehiclePosition' | 'RouteGeometryPoint' | 'RouteSegment',
    ParentType,
    ContextType
  >
  lat?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>
  lng?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>
}

export interface PreciseBBoxScalarConfig
  extends GraphQLScalarTypeConfig<ResolversTypes['PreciseBBox'], any> {
  name: 'PreciseBBox'
}

export type QueryResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']
> = {
  alerts?: Resolver<
    Array<ResolversTypes['Alert']>,
    ParentType,
    ContextType,
    RequireFields<QueryAlertsArgs, 'language'>
  >
  cancellations?: Resolver<
    Array<ResolversTypes['Cancellation']>,
    ParentType,
    ContextType,
    QueryCancellationsArgs
  >
  departures?: Resolver<
    Array<Maybe<ResolversTypes['Departure']>>,
    ParentType,
    ContextType,
    RequireFields<QueryDeparturesArgs, 'date' | 'stopId'>
  >
  equipment?: Resolver<
    Array<Maybe<ResolversTypes['Equipment']>>,
    ParentType,
    ContextType,
    QueryEquipmentArgs
  >
  exceptionDays?: Resolver<
    Array<Maybe<ResolversTypes['ExceptionDay']>>,
    ParentType,
    ContextType,
    RequireFields<QueryExceptionDaysArgs, 'year'>
  >
  journey?: Resolver<
    Maybe<ResolversTypes['Journey']>,
    ParentType,
    ContextType,
    RequireFields<
      QueryJourneyArgs,
      'departureDate' | 'departureTime' | 'direction' | 'routeId'
    >
  >
  journeys?: Resolver<
    Array<Maybe<ResolversTypes['Journey']>>,
    ParentType,
    ContextType,
    RequireFields<QueryJourneysArgs, 'departureDate' | 'direction' | 'routeId'>
  >
  journeysByBbox?: Resolver<
    Array<Maybe<ResolversTypes['Journey']>>,
    ParentType,
    ContextType,
    RequireFields<QueryJourneysByBboxArgs, 'bbox' | 'date' | 'maxTime' | 'minTime'>
  >
  route?: Resolver<
    Maybe<ResolversTypes['Route']>,
    ParentType,
    ContextType,
    RequireFields<QueryRouteArgs, 'date' | 'direction' | 'routeId'>
  >
  routeDepartures?: Resolver<
    Array<Maybe<ResolversTypes['Departure']>>,
    ParentType,
    ContextType,
    RequireFields<QueryRouteDeparturesArgs, 'date' | 'direction' | 'routeId' | 'stopId'>
  >
  routeGeometry?: Resolver<
    Maybe<ResolversTypes['RouteGeometry']>,
    ParentType,
    ContextType,
    RequireFields<QueryRouteGeometryArgs, 'date' | 'direction' | 'routeId'>
  >
  routeSegments?: Resolver<
    Array<Maybe<ResolversTypes['RouteSegment']>>,
    ParentType,
    ContextType,
    RequireFields<QueryRouteSegmentsArgs, 'date' | 'direction' | 'routeId'>
  >
  routes?: Resolver<
    Array<Maybe<ResolversTypes['Route']>>,
    ParentType,
    ContextType,
    QueryRoutesArgs
  >
  stop?: Resolver<
    Maybe<ResolversTypes['Stop']>,
    ParentType,
    ContextType,
    RequireFields<QueryStopArgs, 'date' | 'stopId'>
  >
  stops?: Resolver<
    Array<Maybe<ResolversTypes['Stop']>>,
    ParentType,
    ContextType,
    QueryStopsArgs
  >
  uiMessage?: Resolver<ResolversTypes['UIMessage'], ParentType, ContextType>
  unsignedVehicleEvents?: Resolver<
    Array<Maybe<ResolversTypes['VehiclePosition']>>,
    ParentType,
    ContextType,
    RequireFields<QueryUnsignedVehicleEventsArgs, 'date' | 'uniqueVehicleId'>
  >
  vehicleJourneys?: Resolver<
    Array<Maybe<ResolversTypes['VehicleJourney']>>,
    ParentType,
    ContextType,
    RequireFields<QueryVehicleJourneysArgs, 'date' | 'uniqueVehicleId'>
  >
  weeklyDepartures?: Resolver<
    Array<Maybe<ResolversTypes['Departure']>>,
    ParentType,
    ContextType,
    RequireFields<QueryWeeklyDeparturesArgs, 'date' | 'direction' | 'routeId' | 'stopId'>
  >
}

export type RouteResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['Route'] = ResolversParentTypes['Route']
> = {
  _matchScore?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>
  alerts?: Resolver<Array<ResolversTypes['Alert']>, ParentType, ContextType>
  cancellations?: Resolver<Array<ResolversTypes['Cancellation']>, ParentType, ContextType>
  destination?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
  destinationStopId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
  direction?: Resolver<ResolversTypes['Direction'], ParentType, ContextType>
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>
  mode?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
  origin?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
  originStopId?: Resolver<ResolversTypes['String'], ParentType, ContextType>
  routeDurationMinutes?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>
  routeId?: Resolver<ResolversTypes['String'], ParentType, ContextType>
  routeLength?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>
}

export type RouteGeometryResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['RouteGeometry'] = ResolversParentTypes['RouteGeometry']
> = {
  coordinates?: Resolver<Array<ResolversTypes['RouteGeometryPoint']>, ParentType, ContextType>
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>
  mode?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
}

export type RouteGeometryPointResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['RouteGeometryPoint'] = ResolversParentTypes['RouteGeometryPoint']
> = {
  lat?: Resolver<ResolversTypes['Float'], ParentType, ContextType>
  lng?: Resolver<ResolversTypes['Float'], ParentType, ContextType>
}

export type RouteSegmentResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['RouteSegment'] = ResolversParentTypes['RouteSegment']
> = {
  alerts?: Resolver<Array<ResolversTypes['Alert']>, ParentType, ContextType>
  cancellations?: Resolver<Array<ResolversTypes['Cancellation']>, ParentType, ContextType>
  destination?: Resolver<ResolversTypes['String'], ParentType, ContextType>
  direction?: Resolver<ResolversTypes['Direction'], ParentType, ContextType>
  distanceFromPrevious?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>
  distanceFromStart?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>
  duration?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>
  isTimingStop?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>
  lat?: Resolver<ResolversTypes['Float'], ParentType, ContextType>
  lng?: Resolver<ResolversTypes['Float'], ParentType, ContextType>
  modes?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
  originStopId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
  radius?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>
  routeId?: Resolver<ResolversTypes['String'], ParentType, ContextType>
  shortId?: Resolver<ResolversTypes['String'], ParentType, ContextType>
  stopId?: Resolver<ResolversTypes['String'], ParentType, ContextType>
  stopIndex?: Resolver<ResolversTypes['Int'], ParentType, ContextType>
}

export type StopResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['Stop'] = ResolversParentTypes['Stop']
> = {
  _matchScore?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>
  alerts?: Resolver<Array<ResolversTypes['Alert']>, ParentType, ContextType>
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>
  isTimingStop?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>
  lat?: Resolver<ResolversTypes['Float'], ParentType, ContextType>
  lng?: Resolver<ResolversTypes['Float'], ParentType, ContextType>
  modes?: Resolver<Array<Maybe<ResolversTypes['String']>>, ParentType, ContextType>
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
  radius?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>
  routes?: Resolver<Array<ResolversTypes['StopRoute']>, ParentType, ContextType>
  shortId?: Resolver<ResolversTypes['String'], ParentType, ContextType>
  stopId?: Resolver<ResolversTypes['String'], ParentType, ContextType>
  stopIndex?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>
}

export type StopRouteResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['StopRoute'] = ResolversParentTypes['StopRoute']
> = {
  direction?: Resolver<ResolversTypes['Direction'], ParentType, ContextType>
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>
  isTimingStop?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>
  mode?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
  originStopId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
  routeId?: Resolver<ResolversTypes['String'], ParentType, ContextType>
}

export interface TimeScalarConfig
  extends GraphQLScalarTypeConfig<ResolversTypes['Time'], any> {
  name: 'Time'
}

export type UiMessageResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['UIMessage'] = ResolversParentTypes['UIMessage']
> = {
  date?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
  message?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
}

export interface UploadScalarConfig
  extends GraphQLScalarTypeConfig<ResolversTypes['Upload'], any> {
  name: 'Upload'
}

export interface VehicleIdScalarConfig
  extends GraphQLScalarTypeConfig<ResolversTypes['VehicleId'], any> {
  name: 'VehicleId'
}

export type VehicleJourneyResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['VehicleJourney'] = ResolversParentTypes['VehicleJourney']
> = {
  alerts?: Resolver<Array<ResolversTypes['Alert']>, ParentType, ContextType>
  cancellations?: Resolver<Array<ResolversTypes['Cancellation']>, ParentType, ContextType>
  departureDate?: Resolver<ResolversTypes['Date'], ParentType, ContextType>
  departureTime?: Resolver<ResolversTypes['Time'], ParentType, ContextType>
  direction?: Resolver<Maybe<ResolversTypes['Direction']>, ParentType, ContextType>
  headsign?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>
  isCancelled?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>
  journeyType?: Resolver<ResolversTypes['String'], ParentType, ContextType>
  mode?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
  operatorId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
  recordedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>
  recordedAtUnix?: Resolver<ResolversTypes['Int'], ParentType, ContextType>
  recordedTime?: Resolver<ResolversTypes['Time'], ParentType, ContextType>
  routeId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
  timeDifference?: Resolver<ResolversTypes['Int'], ParentType, ContextType>
  uniqueVehicleId?: Resolver<Maybe<ResolversTypes['VehicleId']>, ParentType, ContextType>
  vehicleId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
}

export type VehiclePositionResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['VehiclePosition'] = ResolversParentTypes['VehiclePosition']
> = {
  delay?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>
  doorStatus?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>
  heading?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>
  journeyType?: Resolver<ResolversTypes['String'], ParentType, ContextType>
  lat?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>
  lng?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>
  mode?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
  nextStopId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
  operatorId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
  receivedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>
  recordedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>
  recordedAtUnix?: Resolver<ResolversTypes['Int'], ParentType, ContextType>
  recordedTime?: Resolver<ResolversTypes['Time'], ParentType, ContextType>
  stop?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
  uniqueVehicleId?: Resolver<Maybe<ResolversTypes['VehicleId']>, ParentType, ContextType>
  vehicleId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
  velocity?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>
}

export type Resolvers<ContextType = any> = {
  Alert?: AlertResolvers<ContextType>
  BBox?: GraphQLScalarType
  Cancellation?: CancellationResolvers<ContextType>
  Date?: GraphQLScalarType
  DateTime?: GraphQLScalarType
  Departure?: DepartureResolvers<ContextType>
  DepartureJourney?: DepartureJourneyResolvers<ContextType>
  Direction?: GraphQLScalarType
  Equipment?: EquipmentResolvers<ContextType>
  ExceptionDay?: ExceptionDayResolvers<ContextType>
  Journey?: JourneyResolvers<ContextType>
  JourneyCancellationEvent?: JourneyCancellationEventResolvers<ContextType>
  JourneyEvent?: JourneyEventResolvers<ContextType>
  JourneyEventType?: JourneyEventTypeResolvers
  JourneyStopEvent?: JourneyStopEventResolvers<ContextType>
  ObservedArrival?: ObservedArrivalResolvers<ContextType>
  ObservedDeparture?: ObservedDepartureResolvers<ContextType>
  PlannedArrival?: PlannedArrivalResolvers<ContextType>
  PlannedDeparture?: PlannedDepartureResolvers<ContextType>
  PlannedStopEvent?: PlannedStopEventResolvers<ContextType>
  Position?: PositionResolvers
  PreciseBBox?: GraphQLScalarType
  Query?: QueryResolvers<ContextType>
  Route?: RouteResolvers<ContextType>
  RouteGeometry?: RouteGeometryResolvers<ContextType>
  RouteGeometryPoint?: RouteGeometryPointResolvers<ContextType>
  RouteSegment?: RouteSegmentResolvers<ContextType>
  Stop?: StopResolvers<ContextType>
  StopRoute?: StopRouteResolvers<ContextType>
  Time?: GraphQLScalarType
  UIMessage?: UiMessageResolvers<ContextType>
  Upload?: GraphQLScalarType
  VehicleId?: GraphQLScalarType
  VehicleJourney?: VehicleJourneyResolvers<ContextType>
  VehiclePosition?: VehiclePositionResolvers<ContextType>
}

/**
 * @deprecated
 * Use "Resolvers" root object instead. If you wish to get "IResolvers", add "typesPrefix: I" to your config.
 */
export type IResolvers<ContextType = any> = Resolvers<ContextType>
