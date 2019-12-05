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
  _isVirtual?: Maybe<Scalars['Boolean']>
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
  index?: Maybe<Scalars['Int']>
  stop?: Maybe<Stop>
  lat?: Maybe<Scalars['Float']>
  lng?: Maybe<Scalars['Float']>
  unplannedStop: Scalars['Boolean']
  _isVirtual?: Maybe<Scalars['Boolean']>
}

export type ObservedArrival = {
  __typename?: 'ObservedArrival'
  id: Scalars['ID']
  arrivalDate: Scalars['Date']
  arrivalTime: Scalars['Time']
  arrivalDateTime: Scalars['DateTime']
  arrivalTimeDifference: Scalars['Int']
}

export type ObservedDeparture = {
  __typename?: 'ObservedDeparture'
  id: Scalars['ID']
  departureDate: Scalars['Date']
  departureTime: Scalars['Time']
  departureDateTime: Scalars['DateTime']
  departureTimeDifference: Scalars['Int']
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
  index?: Maybe<Scalars['Int']>
  stop?: Maybe<Stop>
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
  mode?: Maybe<Scalars['String']>
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
  velocity?: Maybe<Scalars['Float']>
  doorStatus?: Maybe<Scalars['Boolean']>
  delay?: Maybe<Scalars['Int']>
  heading?: Maybe<Scalars['Int']>
  mode?: Maybe<Scalars['String']>
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
  EquipmentFilterInput: EquipmentFilterInput
  String: ResolverTypeWrapper<Scalars['String']>
  Date: ResolverTypeWrapper<Scalars['Date']>
  Equipment: ResolverTypeWrapper<Equipment>
  ID: ResolverTypeWrapper<Scalars['ID']>
  Int: ResolverTypeWrapper<Scalars['Int']>
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>
  Float: ResolverTypeWrapper<Scalars['Float']>
  Stop: ResolverTypeWrapper<Stop>
  Position: ResolverTypeWrapper<Position>
  StopRoute: ResolverTypeWrapper<StopRoute>
  Direction: ResolverTypeWrapper<Scalars['Direction']>
  Alert: ResolverTypeWrapper<Alert>
  AlertLevel: AlertLevel
  AlertCategory: AlertCategory
  AlertDistribution: AlertDistribution
  AlertImpact: AlertImpact
  DateTime: ResolverTypeWrapper<Scalars['DateTime']>
  StopFilterInput: StopFilterInput
  Route: ResolverTypeWrapper<Route>
  Cancellation: ResolverTypeWrapper<Cancellation>
  Time: ResolverTypeWrapper<Scalars['Time']>
  CancellationSubcategory: CancellationSubcategory
  CancellationType: CancellationType
  CancellationEffect: CancellationEffect
  RouteFilterInput: RouteFilterInput
  RouteGeometry: ResolverTypeWrapper<RouteGeometry>
  RouteGeometryPoint: ResolverTypeWrapper<RouteGeometryPoint>
  RouteSegment: ResolverTypeWrapper<RouteSegment>
  DepartureFilterInput: DepartureFilterInput
  Departure: ResolverTypeWrapper<Departure>
  DepartureJourney: ResolverTypeWrapper<DepartureJourney>
  VehicleId: ResolverTypeWrapper<Scalars['VehicleId']>
  JourneyStopEvent: ResolverTypeWrapper<JourneyStopEvent>
  PlannedDeparture: ResolverTypeWrapper<PlannedDeparture>
  PlannedArrival: ResolverTypeWrapper<PlannedArrival>
  ObservedArrival: ResolverTypeWrapper<ObservedArrival>
  ObservedDeparture: ResolverTypeWrapper<ObservedDeparture>
  ExceptionDay: ResolverTypeWrapper<ExceptionDay>
  Journey: ResolverTypeWrapper<
    Omit<Journey, 'events'> & { events: Array<ResolversTypes['JourneyEventType']> }
  >
  VehiclePosition: ResolverTypeWrapper<VehiclePosition>
  JourneyEventType:
    | ResolversTypes['JourneyEvent']
    | ResolversTypes['JourneyStopEvent']
    | ResolversTypes['JourneyCancellationEvent']
    | ResolversTypes['PlannedStopEvent']
  JourneyEvent: ResolverTypeWrapper<JourneyEvent>
  JourneyCancellationEvent: ResolverTypeWrapper<JourneyCancellationEvent>
  PlannedStopEvent: ResolverTypeWrapper<PlannedStopEvent>
  VehicleJourney: ResolverTypeWrapper<VehicleJourney>
  PreciseBBox: ResolverTypeWrapper<Scalars['PreciseBBox']>
  AreaEventsFilterInput: AreaEventsFilterInput
  AlertSearchInput: AlertSearchInput
  CancellationSearchInput: CancellationSearchInput
  UIMessage: ResolverTypeWrapper<UiMessage>
  BBox: ResolverTypeWrapper<Scalars['BBox']>
}

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Query: {}
  EquipmentFilterInput: EquipmentFilterInput
  String: Scalars['String']
  Date: Scalars['Date']
  Equipment: Equipment
  ID: Scalars['ID']
  Int: Scalars['Int']
  Boolean: Scalars['Boolean']
  Float: Scalars['Float']
  Stop: Stop
  Position: Position
  StopRoute: StopRoute
  Direction: Scalars['Direction']
  Alert: Alert
  AlertLevel: AlertLevel
  AlertCategory: AlertCategory
  AlertDistribution: AlertDistribution
  AlertImpact: AlertImpact
  DateTime: Scalars['DateTime']
  StopFilterInput: StopFilterInput
  Route: Route
  Cancellation: Cancellation
  Time: Scalars['Time']
  CancellationSubcategory: CancellationSubcategory
  CancellationType: CancellationType
  CancellationEffect: CancellationEffect
  RouteFilterInput: RouteFilterInput
  RouteGeometry: RouteGeometry
  RouteGeometryPoint: RouteGeometryPoint
  RouteSegment: RouteSegment
  DepartureFilterInput: DepartureFilterInput
  Departure: Departure
  DepartureJourney: DepartureJourney
  VehicleId: Scalars['VehicleId']
  JourneyStopEvent: JourneyStopEvent
  PlannedDeparture: PlannedDeparture
  PlannedArrival: PlannedArrival
  ObservedArrival: ObservedArrival
  ObservedDeparture: ObservedDeparture
  ExceptionDay: ExceptionDay
  Journey: Omit<Journey, 'events'> & {
    events: Array<ResolversParentTypes['JourneyEventType']>
  }
  VehiclePosition: VehiclePosition
  JourneyEventType:
    | ResolversParentTypes['JourneyEvent']
    | ResolversParentTypes['JourneyStopEvent']
    | ResolversParentTypes['JourneyCancellationEvent']
    | ResolversParentTypes['PlannedStopEvent']
  JourneyEvent: JourneyEvent
  JourneyCancellationEvent: JourneyCancellationEvent
  PlannedStopEvent: PlannedStopEvent
  VehicleJourney: VehicleJourney
  PreciseBBox: Scalars['PreciseBBox']
  AreaEventsFilterInput: AreaEventsFilterInput
  AlertSearchInput: AlertSearchInput
  CancellationSearchInput: CancellationSearchInput
  UIMessage: UiMessage
  BBox: Scalars['BBox']
}

export type AlertResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['Alert'] = ResolversParentTypes['Alert']
> = {
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>
  level?: Resolver<ResolversTypes['AlertLevel'], ParentType, ContextType>
  category?: Resolver<ResolversTypes['AlertCategory'], ParentType, ContextType>
  distribution?: Resolver<ResolversTypes['AlertDistribution'], ParentType, ContextType>
  impact?: Resolver<ResolversTypes['AlertImpact'], ParentType, ContextType>
  affectedId?: Resolver<ResolversTypes['String'], ParentType, ContextType>
  startDateTime?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>
  endDateTime?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>
  lastModifiedDateTime?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>
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
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>
  routeId?: Resolver<ResolversTypes['String'], ParentType, ContextType>
  direction?: Resolver<ResolversTypes['Direction'], ParentType, ContextType>
  departureDate?: Resolver<ResolversTypes['Date'], ParentType, ContextType>
  journeyStartTime?: Resolver<ResolversTypes['Time'], ParentType, ContextType>
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>
  category?: Resolver<ResolversTypes['AlertCategory'], ParentType, ContextType>
  subCategory?: Resolver<ResolversTypes['CancellationSubcategory'], ParentType, ContextType>
  isCancelled?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>
  cancellationType?: Resolver<ResolversTypes['CancellationType'], ParentType, ContextType>
  cancellationEffect?: Resolver<ResolversTypes['CancellationEffect'], ParentType, ContextType>
  lastModifiedDateTime?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>
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
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>
  stopId?: Resolver<ResolversTypes['String'], ParentType, ContextType>
  dayType?: Resolver<ResolversTypes['String'], ParentType, ContextType>
  equipmentType?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
  equipmentIsRequired?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>
  equipmentColor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
  operatorId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
  routeId?: Resolver<ResolversTypes['String'], ParentType, ContextType>
  direction?: Resolver<ResolversTypes['Direction'], ParentType, ContextType>
  terminalTime?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>
  recoveryTime?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>
  departureId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>
  operatingUnit?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
  departureTime?: Resolver<ResolversTypes['Time'], ParentType, ContextType>
  departureDate?: Resolver<ResolversTypes['Date'], ParentType, ContextType>
  extraDeparture?: Resolver<ResolversTypes['String'], ParentType, ContextType>
  isNextDay?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>
  isTimingStop?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>
  index?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>
  mode?: Resolver<ResolversTypes['String'], ParentType, ContextType>
  stop?: Resolver<ResolversTypes['Stop'], ParentType, ContextType>
  journey?: Resolver<Maybe<ResolversTypes['DepartureJourney']>, ParentType, ContextType>
  alerts?: Resolver<Array<ResolversTypes['Alert']>, ParentType, ContextType>
  cancellations?: Resolver<Array<ResolversTypes['Cancellation']>, ParentType, ContextType>
  isCancelled?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>
  isOrigin?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>
  departureEvent?: Resolver<Maybe<ResolversTypes['JourneyStopEvent']>, ParentType, ContextType>
  originDepartureTime?: Resolver<
    Maybe<ResolversTypes['PlannedDeparture']>,
    ParentType,
    ContextType
  >
  plannedArrivalTime?: Resolver<ResolversTypes['PlannedArrival'], ParentType, ContextType>
  observedArrivalTime?: Resolver<
    Maybe<ResolversTypes['ObservedArrival']>,
    ParentType,
    ContextType
  >
  plannedDepartureTime?: Resolver<ResolversTypes['PlannedDeparture'], ParentType, ContextType>
  observedDepartureTime?: Resolver<
    Maybe<ResolversTypes['ObservedDeparture']>,
    ParentType,
    ContextType
  >
}

export type DepartureJourneyResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['DepartureJourney'] = ResolversParentTypes['DepartureJourney']
> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>
  journeyType?: Resolver<ResolversTypes['String'], ParentType, ContextType>
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>
  routeId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
  direction?: Resolver<Maybe<ResolversTypes['Direction']>, ParentType, ContextType>
  originStopId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
  departureDate?: Resolver<ResolversTypes['Date'], ParentType, ContextType>
  departureTime?: Resolver<ResolversTypes['Time'], ParentType, ContextType>
  uniqueVehicleId?: Resolver<Maybe<ResolversTypes['VehicleId']>, ParentType, ContextType>
  mode?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
  alerts?: Resolver<Array<ResolversTypes['Alert']>, ParentType, ContextType>
  cancellations?: Resolver<Array<ResolversTypes['Cancellation']>, ParentType, ContextType>
  isCancelled?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>
  _numInstance?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>
}

export interface DirectionScalarConfig
  extends GraphQLScalarTypeConfig<ResolversTypes['Direction'], any> {
  name: 'Direction'
}

export type EquipmentResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['Equipment'] = ResolversParentTypes['Equipment']
> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>
  vehicleId?: Resolver<ResolversTypes['String'], ParentType, ContextType>
  operatorId?: Resolver<ResolversTypes['String'], ParentType, ContextType>
  operatorName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
  registryNr?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
  age?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>
  type?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
  exteriorColor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
  emissionDesc?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
  emissionClass?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
  inService?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>
  _matchScore?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>
}

export type ExceptionDayResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['ExceptionDay'] = ResolversParentTypes['ExceptionDay']
> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>
  exceptionDate?: Resolver<ResolversTypes['Date'], ParentType, ContextType>
  effectiveDayTypes?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>
  scopedDayType?: Resolver<ResolversTypes['String'], ParentType, ContextType>
  dayType?: Resolver<ResolversTypes['String'], ParentType, ContextType>
  modeScope?: Resolver<ResolversTypes['String'], ParentType, ContextType>
  scope?: Resolver<ResolversTypes['String'], ParentType, ContextType>
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
  exclusive?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>
  startTime?: Resolver<Maybe<ResolversTypes['Time']>, ParentType, ContextType>
  endTime?: Resolver<Maybe<ResolversTypes['Time']>, ParentType, ContextType>
}

export type JourneyResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['Journey'] = ResolversParentTypes['Journey']
> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>
  journeyType?: Resolver<ResolversTypes['String'], ParentType, ContextType>
  routeId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
  direction?: Resolver<Maybe<ResolversTypes['Direction']>, ParentType, ContextType>
  originStopId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
  departureDate?: Resolver<ResolversTypes['Date'], ParentType, ContextType>
  departureTime?: Resolver<Maybe<ResolversTypes['Time']>, ParentType, ContextType>
  uniqueVehicleId?: Resolver<Maybe<ResolversTypes['VehicleId']>, ParentType, ContextType>
  operatorId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
  vehicleId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
  headsign?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
  mode?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
  journeyLength?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>
  journeyDurationMinutes?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>
  equipment?: Resolver<Maybe<ResolversTypes['Equipment']>, ParentType, ContextType>
  vehiclePositions?: Resolver<
    Array<ResolversTypes['VehiclePosition']>,
    ParentType,
    ContextType
  >
  events?: Resolver<Array<ResolversTypes['JourneyEventType']>, ParentType, ContextType>
  departure?: Resolver<Maybe<ResolversTypes['Departure']>, ParentType, ContextType>
  routeDepartures?: Resolver<
    Maybe<Array<ResolversTypes['Departure']>>,
    ParentType,
    ContextType
  >
  alerts?: Resolver<Array<ResolversTypes['Alert']>, ParentType, ContextType>
  cancellations?: Resolver<Array<ResolversTypes['Cancellation']>, ParentType, ContextType>
  isCancelled?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>
}

export type JourneyCancellationEventResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['JourneyCancellationEvent'] = ResolversParentTypes['JourneyCancellationEvent']
> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>
  recordedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>
  recordedAtUnix?: Resolver<ResolversTypes['Int'], ParentType, ContextType>
  recordedTime?: Resolver<ResolversTypes['Time'], ParentType, ContextType>
  plannedDate?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>
  plannedTime?: Resolver<Maybe<ResolversTypes['Time']>, ParentType, ContextType>
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>
  category?: Resolver<ResolversTypes['AlertCategory'], ParentType, ContextType>
  subCategory?: Resolver<ResolversTypes['CancellationSubcategory'], ParentType, ContextType>
  isCancelled?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>
  cancellationType?: Resolver<ResolversTypes['CancellationType'], ParentType, ContextType>
  cancellationEffect?: Resolver<ResolversTypes['CancellationEffect'], ParentType, ContextType>
}

export type JourneyEventResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['JourneyEvent'] = ResolversParentTypes['JourneyEvent']
> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>
  receivedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>
  recordedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>
  recordedAtUnix?: Resolver<ResolversTypes['Int'], ParentType, ContextType>
  recordedTime?: Resolver<ResolversTypes['Time'], ParentType, ContextType>
  stopId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
  lat?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>
  lng?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>
  _isVirtual?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>
}

export type JourneyEventTypeResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['JourneyEventType'] = ResolversParentTypes['JourneyEventType']
> = {
  __resolveType: TypeResolveFn<
    'JourneyEvent' | 'JourneyStopEvent' | 'JourneyCancellationEvent' | 'PlannedStopEvent',
    ParentType,
    ContextType
  >
}

export type JourneyStopEventResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['JourneyStopEvent'] = ResolversParentTypes['JourneyStopEvent']
> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>
  receivedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>
  recordedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>
  recordedAtUnix?: Resolver<ResolversTypes['Int'], ParentType, ContextType>
  recordedTime?: Resolver<ResolversTypes['Time'], ParentType, ContextType>
  nextStopId?: Resolver<ResolversTypes['String'], ParentType, ContextType>
  stopId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
  doorsOpened?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>
  stopped?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>
  plannedDate?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>
  plannedTime?: Resolver<Maybe<ResolversTypes['Time']>, ParentType, ContextType>
  plannedDateTime?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>
  plannedUnix?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>
  plannedTimeDifference?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>
  isNextDay?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>
  departureId?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>
  isTimingStop?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>
  isOrigin?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>
  index?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>
  stop?: Resolver<Maybe<ResolversTypes['Stop']>, ParentType, ContextType>
  lat?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>
  lng?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>
  unplannedStop?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>
  _isVirtual?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>
}

export type ObservedArrivalResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['ObservedArrival'] = ResolversParentTypes['ObservedArrival']
> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>
  arrivalDate?: Resolver<ResolversTypes['Date'], ParentType, ContextType>
  arrivalTime?: Resolver<ResolversTypes['Time'], ParentType, ContextType>
  arrivalDateTime?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>
  arrivalTimeDifference?: Resolver<ResolversTypes['Int'], ParentType, ContextType>
}

export type ObservedDepartureResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['ObservedDeparture'] = ResolversParentTypes['ObservedDeparture']
> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>
  departureDate?: Resolver<ResolversTypes['Date'], ParentType, ContextType>
  departureTime?: Resolver<ResolversTypes['Time'], ParentType, ContextType>
  departureDateTime?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>
  departureTimeDifference?: Resolver<ResolversTypes['Int'], ParentType, ContextType>
}

export type PlannedArrivalResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['PlannedArrival'] = ResolversParentTypes['PlannedArrival']
> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>
  arrivalDate?: Resolver<ResolversTypes['Date'], ParentType, ContextType>
  arrivalTime?: Resolver<ResolversTypes['Time'], ParentType, ContextType>
  arrivalDateTime?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>
  isNextDay?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>
}

export type PlannedDepartureResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['PlannedDeparture'] = ResolversParentTypes['PlannedDeparture']
> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>
  departureDate?: Resolver<ResolversTypes['Date'], ParentType, ContextType>
  departureTime?: Resolver<ResolversTypes['Time'], ParentType, ContextType>
  departureDateTime?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>
  isNextDay?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>
}

export type PlannedStopEventResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['PlannedStopEvent'] = ResolversParentTypes['PlannedStopEvent']
> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>
  stopId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
  plannedDate?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>
  plannedTime?: Resolver<Maybe<ResolversTypes['Time']>, ParentType, ContextType>
  plannedDateTime?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>
  plannedUnix?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>
  isNextDay?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>
  departureId?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>
  isTimingStop?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>
  isOrigin?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>
  index?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>
  stop?: Resolver<Maybe<ResolversTypes['Stop']>, ParentType, ContextType>
}

export type PositionResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['Position'] = ResolversParentTypes['Position']
> = {
  __resolveType: TypeResolveFn<
    'Stop' | 'RouteGeometryPoint' | 'RouteSegment' | 'VehiclePosition',
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
  equipment?: Resolver<
    Array<Maybe<ResolversTypes['Equipment']>>,
    ParentType,
    ContextType,
    QueryEquipmentArgs
  >
  stop?: Resolver<
    Maybe<ResolversTypes['Stop']>,
    ParentType,
    ContextType,
    RequireFields<QueryStopArgs, 'stopId' | 'date'>
  >
  stops?: Resolver<
    Array<Maybe<ResolversTypes['Stop']>>,
    ParentType,
    ContextType,
    QueryStopsArgs
  >
  route?: Resolver<
    Maybe<ResolversTypes['Route']>,
    ParentType,
    ContextType,
    RequireFields<QueryRouteArgs, 'routeId' | 'direction' | 'date'>
  >
  routes?: Resolver<
    Array<Maybe<ResolversTypes['Route']>>,
    ParentType,
    ContextType,
    QueryRoutesArgs
  >
  routeGeometry?: Resolver<
    Maybe<ResolversTypes['RouteGeometry']>,
    ParentType,
    ContextType,
    RequireFields<QueryRouteGeometryArgs, 'routeId' | 'direction' | 'date'>
  >
  routeSegments?: Resolver<
    Array<Maybe<ResolversTypes['RouteSegment']>>,
    ParentType,
    ContextType,
    RequireFields<QueryRouteSegmentsArgs, 'routeId' | 'direction' | 'date'>
  >
  departures?: Resolver<
    Array<Maybe<ResolversTypes['Departure']>>,
    ParentType,
    ContextType,
    RequireFields<QueryDeparturesArgs, 'stopId' | 'date'>
  >
  routeDepartures?: Resolver<
    Array<Maybe<ResolversTypes['Departure']>>,
    ParentType,
    ContextType,
    RequireFields<QueryRouteDeparturesArgs, 'stopId' | 'routeId' | 'direction' | 'date'>
  >
  weeklyDepartures?: Resolver<
    Array<Maybe<ResolversTypes['Departure']>>,
    ParentType,
    ContextType,
    RequireFields<QueryWeeklyDeparturesArgs, 'stopId' | 'routeId' | 'direction' | 'date'>
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
      'routeId' | 'direction' | 'departureTime' | 'departureDate'
    >
  >
  journeys?: Resolver<
    Array<Maybe<ResolversTypes['Journey']>>,
    ParentType,
    ContextType,
    RequireFields<QueryJourneysArgs, 'routeId' | 'direction' | 'departureDate'>
  >
  vehicleJourneys?: Resolver<
    Array<Maybe<ResolversTypes['VehicleJourney']>>,
    ParentType,
    ContextType,
    RequireFields<QueryVehicleJourneysArgs, 'uniqueVehicleId' | 'date'>
  >
  journeysByBbox?: Resolver<
    Array<Maybe<ResolversTypes['Journey']>>,
    ParentType,
    ContextType,
    RequireFields<QueryJourneysByBboxArgs, 'minTime' | 'maxTime' | 'bbox' | 'date'>
  >
  unsignedVehicleEvents?: Resolver<
    Array<Maybe<ResolversTypes['VehiclePosition']>>,
    ParentType,
    ContextType,
    RequireFields<QueryUnsignedVehicleEventsArgs, 'uniqueVehicleId' | 'date'>
  >
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
  uiMessage?: Resolver<ResolversTypes['UIMessage'], ParentType, ContextType>
}

export type RouteResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['Route'] = ResolversParentTypes['Route']
> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>
  routeId?: Resolver<ResolversTypes['String'], ParentType, ContextType>
  direction?: Resolver<ResolversTypes['Direction'], ParentType, ContextType>
  destination?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
  origin?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
  destinationStopId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
  originStopId?: Resolver<ResolversTypes['String'], ParentType, ContextType>
  routeLength?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>
  routeDurationMinutes?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>
  mode?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
  alerts?: Resolver<Array<ResolversTypes['Alert']>, ParentType, ContextType>
  cancellations?: Resolver<Array<ResolversTypes['Cancellation']>, ParentType, ContextType>
  _matchScore?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>
}

export type RouteGeometryResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['RouteGeometry'] = ResolversParentTypes['RouteGeometry']
> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>
  mode?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
  coordinates?: Resolver<Array<ResolversTypes['RouteGeometryPoint']>, ParentType, ContextType>
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
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>
  routeId?: Resolver<ResolversTypes['String'], ParentType, ContextType>
  direction?: Resolver<ResolversTypes['Direction'], ParentType, ContextType>
  originStopId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
  destination?: Resolver<ResolversTypes['String'], ParentType, ContextType>
  distanceFromPrevious?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>
  distanceFromStart?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>
  duration?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>
  stopIndex?: Resolver<ResolversTypes['Int'], ParentType, ContextType>
  isTimingStop?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>
  stopId?: Resolver<ResolversTypes['String'], ParentType, ContextType>
  shortId?: Resolver<ResolversTypes['String'], ParentType, ContextType>
  lat?: Resolver<ResolversTypes['Float'], ParentType, ContextType>
  lng?: Resolver<ResolversTypes['Float'], ParentType, ContextType>
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
  radius?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>
  modes?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>
  alerts?: Resolver<Array<ResolversTypes['Alert']>, ParentType, ContextType>
  cancellations?: Resolver<Array<ResolversTypes['Cancellation']>, ParentType, ContextType>
}

export type StopResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['Stop'] = ResolversParentTypes['Stop']
> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>
  stopId?: Resolver<ResolversTypes['String'], ParentType, ContextType>
  shortId?: Resolver<ResolversTypes['String'], ParentType, ContextType>
  lat?: Resolver<ResolversTypes['Float'], ParentType, ContextType>
  lng?: Resolver<ResolversTypes['Float'], ParentType, ContextType>
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
  radius?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>
  routes?: Resolver<Array<ResolversTypes['StopRoute']>, ParentType, ContextType>
  modes?: Resolver<Array<Maybe<ResolversTypes['String']>>, ParentType, ContextType>
  isTimingStop?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>
  stopIndex?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>
  _matchScore?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>
  alerts?: Resolver<Array<ResolversTypes['Alert']>, ParentType, ContextType>
}

export type StopRouteResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['StopRoute'] = ResolversParentTypes['StopRoute']
> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>
  originStopId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
  routeId?: Resolver<ResolversTypes['String'], ParentType, ContextType>
  direction?: Resolver<ResolversTypes['Direction'], ParentType, ContextType>
  isTimingStop?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>
  mode?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
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

export interface VehicleIdScalarConfig
  extends GraphQLScalarTypeConfig<ResolversTypes['VehicleId'], any> {
  name: 'VehicleId'
}

export type VehicleJourneyResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['VehicleJourney'] = ResolversParentTypes['VehicleJourney']
> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>
  journeyType?: Resolver<ResolversTypes['String'], ParentType, ContextType>
  routeId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
  direction?: Resolver<Maybe<ResolversTypes['Direction']>, ParentType, ContextType>
  departureDate?: Resolver<ResolversTypes['Date'], ParentType, ContextType>
  departureTime?: Resolver<ResolversTypes['Time'], ParentType, ContextType>
  uniqueVehicleId?: Resolver<Maybe<ResolversTypes['VehicleId']>, ParentType, ContextType>
  operatorId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
  vehicleId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
  headsign?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
  mode?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
  recordedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>
  recordedAtUnix?: Resolver<ResolversTypes['Int'], ParentType, ContextType>
  recordedTime?: Resolver<ResolversTypes['Time'], ParentType, ContextType>
  timeDifference?: Resolver<ResolversTypes['Int'], ParentType, ContextType>
  alerts?: Resolver<Array<ResolversTypes['Alert']>, ParentType, ContextType>
  cancellations?: Resolver<Array<ResolversTypes['Cancellation']>, ParentType, ContextType>
  isCancelled?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>
}

export type VehiclePositionResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['VehiclePosition'] = ResolversParentTypes['VehiclePosition']
> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>
  journeyType?: Resolver<ResolversTypes['String'], ParentType, ContextType>
  receivedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>
  recordedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>
  recordedAtUnix?: Resolver<ResolversTypes['Int'], ParentType, ContextType>
  recordedTime?: Resolver<ResolversTypes['Time'], ParentType, ContextType>
  stop?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
  nextStopId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
  uniqueVehicleId?: Resolver<Maybe<ResolversTypes['VehicleId']>, ParentType, ContextType>
  operatorId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
  vehicleId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
  lat?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>
  lng?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>
  velocity?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>
  doorStatus?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>
  delay?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>
  heading?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>
  mode?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>
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
  VehicleId?: GraphQLScalarType
  VehicleJourney?: VehicleJourneyResolvers<ContextType>
  VehiclePosition?: VehiclePositionResolvers<ContextType>
}

/**
 * @deprecated
 * Use "Resolvers" root object instead. If you wish to get "IResolvers", add "typesPrefix: I" to your config.
 */
export type IResolvers<ContextType = any> = Resolvers<ContextType>
