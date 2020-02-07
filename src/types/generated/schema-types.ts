export type Maybe<T> = T | null
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string
  String: string
  Boolean: boolean
  Int: number
  Float: number
  Date: any
  Direction: any
  DateTime: any
  Time: any
  VehicleId: any
  PreciseBBox: any
  BBox: any
}

export type Alert = {
  __typename?: 'Alert'
  id: Scalars['String']
  level: AlertLevel
  category: AlertCategory
  distribution: AlertDistribution
  impact: AlertImpact
  affectedId: Scalars['String']
  startDateTime: Scalars['DateTime']
  endDateTime: Scalars['DateTime']
  lastModifiedDateTime: Scalars['DateTime']
  title: Scalars['String']
  description: Scalars['String']
  url?: Maybe<Scalars['String']>
  bulletinId: Scalars['String']
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
  Hidden = 'HIDDEN',
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

export enum AlertLevel {
  Info = 'INFO',
  Warning = 'WARNING',
  Severe = 'SEVERE',
}

export type AlertSearchInput = {
  all?: Maybe<Scalars['Boolean']>
  network?: Maybe<Scalars['Boolean']>
  allRoutes?: Maybe<Scalars['Boolean']>
  allStops?: Maybe<Scalars['Boolean']>
  route?: Maybe<Scalars['String']>
  stop?: Maybe<Scalars['String']>
}

export type AreaEventsFilterInput = {
  routeId?: Maybe<Scalars['String']>
  direction?: Maybe<Scalars['Direction']>
}

export type Cancellation = {
  __typename?: 'Cancellation'
  id: Scalars['Int']
  routeId: Scalars['String']
  direction: Scalars['Direction']
  departureDate: Scalars['Date']
  journeyStartTime: Scalars['Time']
  title: Scalars['String']
  description: Scalars['String']
  category: AlertCategory
  subCategory: CancellationSubcategory
  isCancelled: Scalars['Boolean']
  cancellationType: CancellationType
  cancellationEffect: CancellationEffect
  lastModifiedDateTime: Scalars['DateTime']
}

export enum CancellationEffect {
  CancelEntireDeparture = 'CANCEL_ENTIRE_DEPARTURE',
  CancelStopsFromStart = 'CANCEL_STOPS_FROM_START',
  CancelStopsFromMiddle = 'CANCEL_STOPS_FROM_MIDDLE',
  CancelStopsFromEnd = 'CANCEL_STOPS_FROM_END',
}

export type CancellationSearchInput = {
  all?: Maybe<Scalars['Boolean']>
  routeId?: Maybe<Scalars['String']>
  direction?: Maybe<Scalars['Int']>
  departureTime?: Maybe<Scalars['String']>
  latestOnly?: Maybe<Scalars['Boolean']>
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
  DoorMalfunction = 'DOOR_MALFUNCTION',
  UnknownCause = 'UNKNOWN_CAUSE',
  Hidden = 'HIDDEN',
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

export type Departure = {
  __typename?: 'Departure'
  id: Scalars['ID']
  stopId: Scalars['String']
  dayType: Scalars['String']
  equipmentType?: Maybe<Scalars['String']>
  equipmentIsRequired?: Maybe<Scalars['Boolean']>
  equipmentColor?: Maybe<Scalars['String']>
  operatorId?: Maybe<Scalars['String']>
  routeId: Scalars['String']
  direction: Scalars['Direction']
  terminalTime?: Maybe<Scalars['Int']>
  recoveryTime?: Maybe<Scalars['Int']>
  departureId: Scalars['Int']
  operatingUnit?: Maybe<Scalars['String']>
  departureTime: Scalars['Time']
  departureDate: Scalars['Date']
  extraDeparture: Scalars['String']
  isNextDay: Scalars['Boolean']
  isTimingStop: Scalars['Boolean']
  index?: Maybe<Scalars['Int']>
  mode: Scalars['String']
  stop: Stop
  journey?: Maybe<DepartureJourney>
  alerts: Alert[]
  cancellations: Cancellation[]
  isCancelled: Scalars['Boolean']
  isOrigin?: Maybe<Scalars['Boolean']>
  departureEvent?: Maybe<JourneyStopEvent>
  originDepartureTime?: Maybe<PlannedDeparture>
  plannedArrivalTime: PlannedArrival
  observedArrivalTime?: Maybe<ObservedArrival>
  plannedDepartureTime: PlannedDeparture
  observedDepartureTime?: Maybe<ObservedDeparture>
}

export type DepartureFilterInput = {
  routeId?: Maybe<Scalars['String']>
  direction?: Maybe<Scalars['Direction']>
  minHour?: Maybe<Scalars['Int']>
  maxHour?: Maybe<Scalars['Int']>
}

export type DepartureJourney = {
  __typename?: 'DepartureJourney'
  id: Scalars['ID']
  journeyType: Scalars['String']
  type: Scalars['String']
  routeId?: Maybe<Scalars['String']>
  direction?: Maybe<Scalars['Direction']>
  originStopId?: Maybe<Scalars['String']>
  departureDate: Scalars['Date']
  departureTime: Scalars['Time']
  uniqueVehicleId?: Maybe<Scalars['VehicleId']>
  mode?: Maybe<Scalars['String']>
  alerts: Alert[]
  cancellations: Cancellation[]
  isCancelled: Scalars['Boolean']
  _numInstance?: Maybe<Scalars['Int']>
}

export type DriverEvent = {
  __typename?: 'DriverEvent'
  id: Scalars['ID']
  journeyType: Scalars['String']
  eventType: Scalars['String']
  uniqueVehicleId?: Maybe<Scalars['VehicleId']>
  operatorId?: Maybe<Scalars['String']>
  vehicleId?: Maybe<Scalars['String']>
  mode?: Maybe<Scalars['String']>
  recordedAt: Scalars['DateTime']
  recordedAtUnix: Scalars['Int']
  recordedTime: Scalars['Time']
  receivedAt?: Maybe<Scalars['DateTime']>
  lat?: Maybe<Scalars['Float']>
  lng?: Maybe<Scalars['Float']>
  loc?: Maybe<Scalars['String']>
}

export type Equipment = {
  __typename?: 'Equipment'
  id: Scalars['ID']
  vehicleId: Scalars['String']
  operatorId: Scalars['String']
  operatorName?: Maybe<Scalars['String']>
  registryNr?: Maybe<Scalars['String']>
  age?: Maybe<Scalars['Int']>
  type?: Maybe<Scalars['String']>
  exteriorColor?: Maybe<Scalars['String']>
  emissionDesc?: Maybe<Scalars['String']>
  emissionClass?: Maybe<Scalars['String']>
  inService?: Maybe<Scalars['Boolean']>
  _matchScore?: Maybe<Scalars['Float']>
}

export type EquipmentFilterInput = {
  vehicleId?: Maybe<Scalars['String']>
  operatorId?: Maybe<Scalars['String']>
  search?: Maybe<Scalars['String']>
}

export type ExceptionDay = {
  __typename?: 'ExceptionDay'
  id: Scalars['ID']
  exceptionDate: Scalars['Date']
  effectiveDayTypes: Array<Scalars['String']>
  scopedDayType: Scalars['String']
  dayType: Scalars['String']
  modeScope: Scalars['String']
  scope: Scalars['String']
  description?: Maybe<Scalars['String']>
  exclusive: Scalars['Boolean']
  startTime?: Maybe<Scalars['Time']>
  endTime?: Maybe<Scalars['Time']>
}

export type Journey = {
  __typename?: 'Journey'
  id: Scalars['ID']
  journeyType: Scalars['String']
  routeId?: Maybe<Scalars['String']>
  direction?: Maybe<Scalars['Direction']>
  originStopId?: Maybe<Scalars['String']>
  departureDate: Scalars['Date']
  departureTime?: Maybe<Scalars['Time']>
  uniqueVehicleId?: Maybe<Scalars['VehicleId']>
  operatorId?: Maybe<Scalars['String']>
  vehicleId?: Maybe<Scalars['String']>
  headsign?: Maybe<Scalars['String']>
  name?: Maybe<Scalars['String']>
  mode?: Maybe<Scalars['String']>
  journeyLength?: Maybe<Scalars['Int']>
  journeyDurationMinutes?: Maybe<Scalars['Int']>
  equipment?: Maybe<Equipment>
  vehiclePositions: VehiclePosition[]
  events: JourneyEventType[]
  departure?: Maybe<Departure>
  routeDepartures?: Maybe<Departure[]>
  alerts: Alert[]
  cancellations: Cancellation[]
  isCancelled: Scalars['Boolean']
}

export type JourneyCancellationEvent = {
  __typename?: 'JourneyCancellationEvent'
  id: Scalars['ID']
  type: Scalars['String']
  recordedAt: Scalars['DateTime']
  recordedAtUnix: Scalars['Int']
  recordedTime: Scalars['Time']
  plannedDate?: Maybe<Scalars['Date']>
  plannedTime?: Maybe<Scalars['Time']>
  title: Scalars['String']
  description: Scalars['String']
  category: AlertCategory
  subCategory: CancellationSubcategory
  isCancelled: Scalars['Boolean']
  cancellationType: CancellationType
  cancellationEffect: CancellationEffect
  _sort?: Maybe<Scalars['Int']>
}

export type JourneyEvent = {
  __typename?: 'JourneyEvent'
  id: Scalars['ID']
  type: Scalars['String']
  receivedAt: Scalars['DateTime']
  recordedAt: Scalars['DateTime']
  recordedAtUnix: Scalars['Int']
  recordedTime: Scalars['Time']
  stopId?: Maybe<Scalars['String']>
  lat?: Maybe<Scalars['Float']>
  lng?: Maybe<Scalars['Float']>
  loc?: Maybe<Scalars['String']>
  _isVirtual?: Maybe<Scalars['Boolean']>
  _sort?: Maybe<Scalars['Int']>
}

export type JourneyEventType =
  | JourneyEvent
  | JourneyStopEvent
  | JourneyCancellationEvent
  | PlannedStopEvent

export type JourneyStopEvent = {
  __typename?: 'JourneyStopEvent'
  id: Scalars['ID']
  type: Scalars['String']
  receivedAt: Scalars['DateTime']
  recordedAt: Scalars['DateTime']
  recordedAtUnix: Scalars['Int']
  recordedTime: Scalars['Time']
  nextStopId: Scalars['String']
  stopId?: Maybe<Scalars['String']>
  doorsOpened?: Maybe<Scalars['Boolean']>
  stopped?: Maybe<Scalars['Boolean']>
  plannedDate?: Maybe<Scalars['Date']>
  plannedTime?: Maybe<Scalars['Time']>
  plannedDateTime?: Maybe<Scalars['DateTime']>
  plannedUnix?: Maybe<Scalars['Int']>
  plannedTimeDifference?: Maybe<Scalars['Int']>
  isNextDay?: Maybe<Scalars['Boolean']>
  departureId?: Maybe<Scalars['Int']>
  isTimingStop: Scalars['Boolean']
  isOrigin?: Maybe<Scalars['Boolean']>
  index: Scalars['Int']
  stop?: Maybe<Stop>
  lat?: Maybe<Scalars['Float']>
  lng?: Maybe<Scalars['Float']>
  loc?: Maybe<Scalars['String']>
  unplannedStop: Scalars['Boolean']
  _isVirtual?: Maybe<Scalars['Boolean']>
  _sort?: Maybe<Scalars['Int']>
}

export type ObservedArrival = {
  __typename?: 'ObservedArrival'
  id: Scalars['ID']
  arrivalDate: Scalars['Date']
  arrivalTime: Scalars['Time']
  arrivalDateTime: Scalars['DateTime']
  arrivalTimeDifference: Scalars['Int']
  loc?: Maybe<Scalars['String']>
}

export type ObservedDeparture = {
  __typename?: 'ObservedDeparture'
  id: Scalars['ID']
  departureDate: Scalars['Date']
  departureTime: Scalars['Time']
  departureDateTime: Scalars['DateTime']
  departureTimeDifference: Scalars['Int']
  loc?: Maybe<Scalars['String']>
}

export type PlannedArrival = {
  __typename?: 'PlannedArrival'
  id: Scalars['ID']
  arrivalDate: Scalars['Date']
  arrivalTime: Scalars['Time']
  arrivalDateTime: Scalars['DateTime']
  isNextDay?: Maybe<Scalars['Boolean']>
}

export type PlannedDeparture = {
  __typename?: 'PlannedDeparture'
  id: Scalars['ID']
  departureDate: Scalars['Date']
  departureTime: Scalars['Time']
  departureDateTime: Scalars['DateTime']
  isNextDay?: Maybe<Scalars['Boolean']>
}

export type PlannedStopEvent = {
  __typename?: 'PlannedStopEvent'
  id: Scalars['ID']
  type: Scalars['String']
  stopId?: Maybe<Scalars['String']>
  plannedDate?: Maybe<Scalars['Date']>
  plannedTime?: Maybe<Scalars['Time']>
  plannedDateTime?: Maybe<Scalars['DateTime']>
  plannedUnix?: Maybe<Scalars['Int']>
  isNextDay?: Maybe<Scalars['Boolean']>
  departureId?: Maybe<Scalars['Int']>
  isTimingStop: Scalars['Boolean']
  isOrigin?: Maybe<Scalars['Boolean']>
  index: Scalars['Int']
  stop?: Maybe<Stop>
  _sort?: Maybe<Scalars['Int']>
}

/** Any object that describes something with a position implements this interface. */
export type Position = {
  lat?: Maybe<Scalars['Float']>
  lng?: Maybe<Scalars['Float']>
}

export type Query = {
  __typename?: 'Query'
  equipment: Array<Maybe<Equipment>>
  stop?: Maybe<Stop>
  stops: Array<Maybe<Stop>>
  terminals: Array<Maybe<Terminal>>
  route?: Maybe<Route>
  routes: Array<Maybe<Route>>
  routeGeometry?: Maybe<RouteGeometry>
  routeSegments: Array<Maybe<RouteSegment>>
  departures: Array<Maybe<Departure>>
  routeDepartures: Array<Maybe<Departure>>
  weeklyDepartures: Array<Maybe<Departure>>
  exceptionDays: Array<Maybe<ExceptionDay>>
  journey?: Maybe<Journey>
  journeys: Array<Maybe<Journey>>
  vehicleJourneys: Array<Maybe<VehicleJourney>>
  driverEvents: Array<Maybe<DriverEvent>>
  journeysByBbox: Array<Maybe<Journey>>
  unsignedVehicleEvents: Array<Maybe<VehiclePosition>>
  alerts: Alert[]
  cancellations: Cancellation[]
  uiMessage: UiMessage
}

export type QueryEquipmentArgs = {
  filter?: Maybe<EquipmentFilterInput>
  date?: Maybe<Scalars['Date']>
}

export type QueryStopArgs = {
  stopId: Scalars['String']
  date: Scalars['Date']
}

export type QueryStopsArgs = {
  date?: Maybe<Scalars['Date']>
  filter?: Maybe<StopFilterInput>
}

export type QueryTerminalsArgs = {
  date?: Maybe<Scalars['Date']>
}

export type QueryRouteArgs = {
  routeId: Scalars['String']
  direction: Scalars['Direction']
  date: Scalars['Date']
}

export type QueryRoutesArgs = {
  filter?: Maybe<RouteFilterInput>
  date?: Maybe<Scalars['Date']>
}

export type QueryRouteGeometryArgs = {
  routeId: Scalars['String']
  direction: Scalars['Direction']
  date: Scalars['Date']
}

export type QueryRouteSegmentsArgs = {
  routeId: Scalars['String']
  direction: Scalars['Direction']
  date: Scalars['Date']
}

export type QueryDeparturesArgs = {
  filter?: Maybe<DepartureFilterInput>
  stopId: Scalars['String']
  date: Scalars['Date']
}

export type QueryRouteDeparturesArgs = {
  stopId: Scalars['String']
  routeId: Scalars['String']
  direction: Scalars['Direction']
  date: Scalars['Date']
}

export type QueryWeeklyDeparturesArgs = {
  stopId: Scalars['String']
  routeId: Scalars['String']
  direction: Scalars['Direction']
  date: Scalars['Date']
  lastStopArrival?: Maybe<Scalars['Boolean']>
}

export type QueryExceptionDaysArgs = {
  year: Scalars['String']
}

export type QueryJourneyArgs = {
  routeId: Scalars['String']
  direction: Scalars['Direction']
  departureTime: Scalars['Time']
  departureDate: Scalars['Date']
  uniqueVehicleId?: Maybe<Scalars['VehicleId']>
  unsignedEvents?: Maybe<Scalars['Boolean']>
}

export type QueryJourneysArgs = {
  routeId: Scalars['String']
  direction: Scalars['Direction']
  departureDate: Scalars['Date']
}

export type QueryVehicleJourneysArgs = {
  uniqueVehicleId: Scalars['VehicleId']
  date: Scalars['Date']
  unsignedEvents?: Maybe<Scalars['Boolean']>
}

export type QueryDriverEventsArgs = {
  uniqueVehicleId: Scalars['VehicleId']
  date: Scalars['Date']
}

export type QueryJourneysByBboxArgs = {
  minTime: Scalars['DateTime']
  maxTime: Scalars['DateTime']
  bbox: Scalars['PreciseBBox']
  date: Scalars['Date']
  filters?: Maybe<AreaEventsFilterInput>
  unsignedEvents?: Maybe<Scalars['Boolean']>
}

export type QueryUnsignedVehicleEventsArgs = {
  uniqueVehicleId: Scalars['VehicleId']
  date: Scalars['Date']
}

export type QueryAlertsArgs = {
  time?: Maybe<Scalars['String']>
  language: Scalars['String']
  alertSearch?: Maybe<AlertSearchInput>
}

export type QueryCancellationsArgs = {
  date?: Maybe<Scalars['Date']>
  cancellationSearch?: Maybe<CancellationSearchInput>
}

export type Route = {
  __typename?: 'Route'
  id: Scalars['ID']
  routeId: Scalars['String']
  direction: Scalars['Direction']
  destination?: Maybe<Scalars['String']>
  origin?: Maybe<Scalars['String']>
  name?: Maybe<Scalars['String']>
  destinationStopId?: Maybe<Scalars['String']>
  originStopId: Scalars['String']
  routeLength?: Maybe<Scalars['Int']>
  routeDurationMinutes?: Maybe<Scalars['Int']>
  mode?: Maybe<Scalars['String']>
  alerts: Alert[]
  cancellations: Cancellation[]
  _matchScore?: Maybe<Scalars['Float']>
}

export type RouteFilterInput = {
  routeId?: Maybe<Scalars['String']>
  direction?: Maybe<Scalars['Direction']>
  search?: Maybe<Scalars['String']>
}

export type RouteGeometry = {
  __typename?: 'RouteGeometry'
  id: Scalars['ID']
  mode?: Maybe<Scalars['String']>
  coordinates: RouteGeometryPoint[]
}

export type RouteGeometryPoint = Position & {
  __typename?: 'RouteGeometryPoint'
  lat: Scalars['Float']
  lng: Scalars['Float']
}

export type RouteSegment = Position & {
  __typename?: 'RouteSegment'
  id: Scalars['ID']
  routeId: Scalars['String']
  direction: Scalars['Direction']
  originStopId?: Maybe<Scalars['String']>
  destination: Scalars['String']
  distanceFromPrevious?: Maybe<Scalars['Int']>
  distanceFromStart?: Maybe<Scalars['Int']>
  duration?: Maybe<Scalars['Int']>
  stopIndex: Scalars['Int']
  isTimingStop: Scalars['Boolean']
  stopId: Scalars['String']
  shortId: Scalars['String']
  lat: Scalars['Float']
  lng: Scalars['Float']
  name?: Maybe<Scalars['String']>
  radius?: Maybe<Scalars['Float']>
  modes?: Maybe<Array<Scalars['String']>>
  alerts: Alert[]
  cancellations: Cancellation[]
}

export type Stop = Position & {
  __typename?: 'Stop'
  id: Scalars['ID']
  stopId: Scalars['String']
  shortId: Scalars['String']
  lat: Scalars['Float']
  lng: Scalars['Float']
  name?: Maybe<Scalars['String']>
  radius?: Maybe<Scalars['Float']>
  routes: StopRoute[]
  modes: Array<Maybe<Scalars['String']>>
  isTimingStop: Scalars['Boolean']
  stopIndex?: Maybe<Scalars['Int']>
  _matchScore?: Maybe<Scalars['Float']>
  alerts: Alert[]
}

export type StopFilterInput = {
  search?: Maybe<Scalars['String']>
}

export type StopRoute = {
  __typename?: 'StopRoute'
  id: Scalars['ID']
  originStopId?: Maybe<Scalars['String']>
  routeId: Scalars['String']
  direction: Scalars['Direction']
  isTimingStop: Scalars['Boolean']
  destination?: Maybe<Scalars['String']>
  origin?: Maybe<Scalars['String']>
  name?: Maybe<Scalars['String']>
  mode?: Maybe<Scalars['String']>
}

export type Terminal = Position & {
  __typename?: 'Terminal'
  id: Scalars['ID']
  name: Scalars['String']
  lat: Scalars['Float']
  lng: Scalars['Float']
  stops?: Maybe<Array<Scalars['String']>>
  modes?: Maybe<Array<Scalars['String']>>
}

export type UiMessage = {
  __typename?: 'UIMessage'
  date?: Maybe<Scalars['String']>
  message?: Maybe<Scalars['String']>
}

export type VehicleJourney = {
  __typename?: 'VehicleJourney'
  id: Scalars['ID']
  journeyType: Scalars['String']
  routeId?: Maybe<Scalars['String']>
  direction?: Maybe<Scalars['Direction']>
  departureDate: Scalars['Date']
  departureTime: Scalars['Time']
  uniqueVehicleId?: Maybe<Scalars['VehicleId']>
  operatorId?: Maybe<Scalars['String']>
  vehicleId?: Maybe<Scalars['String']>
  headsign?: Maybe<Scalars['String']>
  mode?: Maybe<Scalars['String']>
  recordedAt: Scalars['DateTime']
  recordedAtUnix: Scalars['Int']
  recordedTime: Scalars['Time']
  timeDifference: Scalars['Int']
  loc?: Maybe<Scalars['String']>
  alerts: Alert[]
  cancellations: Cancellation[]
  isCancelled: Scalars['Boolean']
}

export type VehiclePosition = Position & {
  __typename?: 'VehiclePosition'
  id: Scalars['ID']
  journeyType: Scalars['String']
  receivedAt: Scalars['DateTime']
  recordedAt: Scalars['DateTime']
  recordedAtUnix: Scalars['Int']
  recordedTime: Scalars['Time']
  stop?: Maybe<Scalars['String']>
  nextStopId?: Maybe<Scalars['String']>
  uniqueVehicleId?: Maybe<Scalars['VehicleId']>
  operatorId?: Maybe<Scalars['String']>
  vehicleId?: Maybe<Scalars['String']>
  lat?: Maybe<Scalars['Float']>
  lng?: Maybe<Scalars['Float']>
  loc?: Maybe<Scalars['String']>
  velocity?: Maybe<Scalars['Float']>
  doorStatus?: Maybe<Scalars['Boolean']>
  delay?: Maybe<Scalars['Int']>
  heading?: Maybe<Scalars['Int']>
  mode?: Maybe<Scalars['String']>
  _sort?: Maybe<Scalars['Int']>
}
