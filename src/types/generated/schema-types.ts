export type Maybe<T> = T | null
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

export type Operator = {
  __typename?: 'Operator'
  operatorId: Scalars['String']
  operatorName?: Maybe<Scalars['String']>
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
  operators?: Maybe<Operator[]>
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
  recordedAt: Scalars['DateTime']
  recordedAtUnix: Scalars['Int']
  recordedTime: Scalars['Time']
  stop?: Maybe<Scalars['String']>
  uniqueVehicleId?: Maybe<Scalars['VehicleId']>
  vehicleId?: Maybe<Scalars['String']>
  velocity?: Maybe<Scalars['Float']>
}
