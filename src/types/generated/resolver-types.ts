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

export interface CancellationSearchInput {
  all?: Maybe<boolean>

  routeId?: Maybe<string>

  direction?: Maybe<number>

  departureTime?: Maybe<string>

  latestOnly?: Maybe<boolean>
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

/** A string that defines a bounding box. The coordinates should be in the format `minLng,maxLat,maxLng,minLat` which is compatible with what Leaflet's LatLngBounds.toBBoxString() returns. The precise bbox is not rounded. */
export type PreciseBBox = any

/** Time is seconds from 00:00:00 in format HH:mm:ss. The hours value can be more than 23. The timezone is assumed to be Europe/Helsinki */
export type Time = any

/** A string that uniquely identifies a vehicle. The format is [operator ID]/[vehicle ID]. The operator ID is padded to have a length of 4 characters. */
export type VehicleId = any

/** A string that defines a bounding box. The coordinates should be in the format `minLng,maxLat,maxLng,minLat` which is compatible with what Leaflet's LatLngBounds.toBBoxString() returns. Toe coordinates will be rounded, use PreciseBBox if this is not desired. */
export type BBox = any

/** The `Upload` scalar type represents a file upload. */
export type Upload = any
import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql'

export type Resolver<Result, Parent = {}, TContext = {}, Args = {}> = (
  parent: Parent,
  args: Args,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<Result> | Result

export interface ISubscriptionResolverObject<Result, Parent, TContext, Args> {
  subscribe<R = Result, P = Parent>(
    parent: P,
    args: Args,
    context: TContext,
    info: GraphQLResolveInfo
  ): AsyncIterator<R | Result> | Promise<AsyncIterator<R | Result>>
  resolve?<R = Result, P = Parent>(
    parent: P,
    args: Args,
    context: TContext,
    info: GraphQLResolveInfo
  ): R | Result | Promise<R | Result>
}

export type SubscriptionResolver<Result, Parent = {}, TContext = {}, Args = {}> =
  | ((...args: any[]) => ISubscriptionResolverObject<Result, Parent, TContext, Args>)
  | ISubscriptionResolverObject<Result, Parent, TContext, Args>

export type TypeResolveFn<Types, Parent = {}, TContext = {}> = (
  parent: Parent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<Types>

export type NextResolverFn<T> = () => Promise<T>

export type DirectiveResolverFn<TResult, TArgs = {}, TContext = {}> = (
  next: NextResolverFn<TResult>,
  source: any,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>

export namespace QueryResolvers {
  export interface Resolvers<TContext = {}, TypeParent = {}> {
    equipment?: EquipmentResolver<Array<Maybe<Equipment>>, TypeParent, TContext>

    stop?: StopResolver<Maybe<Stop>, TypeParent, TContext>

    stops?: StopsResolver<Array<Maybe<Stop>>, TypeParent, TContext>

    stopsByBbox?: StopsByBboxResolver<Array<Maybe<Stop>>, TypeParent, TContext>

    route?: RouteResolver<Maybe<Route>, TypeParent, TContext>

    routes?: RoutesResolver<Array<Maybe<Route>>, TypeParent, TContext>

    routeGeometry?: RouteGeometryResolver<Maybe<RouteGeometry>, TypeParent, TContext>

    routeSegments?: RouteSegmentsResolver<Array<Maybe<RouteSegment>>, TypeParent, TContext>

    lines?: LinesResolver<Array<Maybe<Line>>, TypeParent, TContext>

    departures?: DeparturesResolver<Array<Maybe<Departure>>, TypeParent, TContext>

    routeDepartures?: RouteDeparturesResolver<Array<Maybe<Departure>>, TypeParent, TContext>

    weeklyDepartures?: WeeklyDeparturesResolver<Array<Maybe<Departure>>, TypeParent, TContext>

    exceptionDays?: ExceptionDaysResolver<Array<Maybe<ExceptionDay>>, TypeParent, TContext>

    journey?: JourneyResolver<Maybe<Journey>, TypeParent, TContext>

    journeys?: JourneysResolver<Array<Maybe<Journey>>, TypeParent, TContext>

    vehicleJourneys?: VehicleJourneysResolver<
      Array<Maybe<VehicleJourney>>,
      TypeParent,
      TContext
    >

    eventsByBbox?: EventsByBboxResolver<Array<Maybe<AreaJourney>>, TypeParent, TContext>

    alerts?: AlertsResolver<Alert[], TypeParent, TContext>

    cancellations?: CancellationsResolver<Cancellation[], TypeParent, TContext>

    uiMessage?: UiMessageResolver<UiMessage, TypeParent, TContext>
  }

  export type EquipmentResolver<
    R = Array<Maybe<Equipment>>,
    Parent = {},
    TContext = {}
  > = Resolver<R, Parent, TContext, EquipmentArgs>
  export interface EquipmentArgs {
    filter?: Maybe<EquipmentFilterInput>

    date?: Maybe<Date>
  }

  export type StopResolver<R = Maybe<Stop>, Parent = {}, TContext = {}> = Resolver<
    R,
    Parent,
    TContext,
    StopArgs
  >
  export interface StopArgs {
    stopId: string

    date: Date
  }

  export type StopsResolver<R = Array<Maybe<Stop>>, Parent = {}, TContext = {}> = Resolver<
    R,
    Parent,
    TContext,
    StopsArgs
  >
  export interface StopsArgs {
    date?: Maybe<Date>

    filter?: Maybe<StopFilterInput>
  }

  export type StopsByBboxResolver<
    R = Array<Maybe<Stop>>,
    Parent = {},
    TContext = {}
  > = Resolver<R, Parent, TContext, StopsByBboxArgs>
  export interface StopsByBboxArgs {
    filter?: Maybe<StopFilterInput>

    bbox: PreciseBBox
  }

  export type RouteResolver<R = Maybe<Route>, Parent = {}, TContext = {}> = Resolver<
    R,
    Parent,
    TContext,
    RouteArgs
  >
  export interface RouteArgs {
    routeId: string

    direction: Direction

    date: Date
  }

  export type RoutesResolver<R = Array<Maybe<Route>>, Parent = {}, TContext = {}> = Resolver<
    R,
    Parent,
    TContext,
    RoutesArgs
  >
  export interface RoutesArgs {
    filter?: Maybe<RouteFilterInput>

    line?: Maybe<string>

    date?: Maybe<Date>
  }

  export type RouteGeometryResolver<
    R = Maybe<RouteGeometry>,
    Parent = {},
    TContext = {}
  > = Resolver<R, Parent, TContext, RouteGeometryArgs>
  export interface RouteGeometryArgs {
    routeId: string

    direction: Direction

    date: Date
  }

  export type RouteSegmentsResolver<
    R = Array<Maybe<RouteSegment>>,
    Parent = {},
    TContext = {}
  > = Resolver<R, Parent, TContext, RouteSegmentsArgs>
  export interface RouteSegmentsArgs {
    routeId: string

    direction: Direction

    date: Date
  }

  export type LinesResolver<R = Array<Maybe<Line>>, Parent = {}, TContext = {}> = Resolver<
    R,
    Parent,
    TContext,
    LinesArgs
  >
  export interface LinesArgs {
    filter?: Maybe<LineFilterInput>

    date?: Maybe<Date>

    includeLinesWithoutRoutes?: boolean
  }

  export type DeparturesResolver<
    R = Array<Maybe<Departure>>,
    Parent = {},
    TContext = {}
  > = Resolver<R, Parent, TContext, DeparturesArgs>
  export interface DeparturesArgs {
    filter?: Maybe<DepartureFilterInput>

    stopId: string

    date: Date
  }

  export type RouteDeparturesResolver<
    R = Array<Maybe<Departure>>,
    Parent = {},
    TContext = {}
  > = Resolver<R, Parent, TContext, RouteDeparturesArgs>
  export interface RouteDeparturesArgs {
    stopId: string

    routeId: string

    direction: Direction

    date: Date
  }

  export type WeeklyDeparturesResolver<
    R = Array<Maybe<Departure>>,
    Parent = {},
    TContext = {}
  > = Resolver<R, Parent, TContext, WeeklyDeparturesArgs>
  export interface WeeklyDeparturesArgs {
    stopId: string

    routeId: string

    direction: Direction

    date: Date
  }

  export type ExceptionDaysResolver<
    R = Array<Maybe<ExceptionDay>>,
    Parent = {},
    TContext = {}
  > = Resolver<R, Parent, TContext, ExceptionDaysArgs>
  export interface ExceptionDaysArgs {
    year: string
  }

  export type JourneyResolver<R = Maybe<Journey>, Parent = {}, TContext = {}> = Resolver<
    R,
    Parent,
    TContext,
    JourneyArgs
  >
  export interface JourneyArgs {
    routeId: string

    direction: Direction

    departureTime: Time

    departureDate: Date

    uniqueVehicleId?: Maybe<VehicleId>
  }

  export type JourneysResolver<
    R = Array<Maybe<Journey>>,
    Parent = {},
    TContext = {}
  > = Resolver<R, Parent, TContext, JourneysArgs>
  export interface JourneysArgs {
    routeId: string

    direction: Direction

    departureDate: Date
  }

  export type VehicleJourneysResolver<
    R = Array<Maybe<VehicleJourney>>,
    Parent = {},
    TContext = {}
  > = Resolver<R, Parent, TContext, VehicleJourneysArgs>
  export interface VehicleJourneysArgs {
    uniqueVehicleId: VehicleId

    date: Date
  }

  export type EventsByBboxResolver<
    R = Array<Maybe<AreaJourney>>,
    Parent = {},
    TContext = {}
  > = Resolver<R, Parent, TContext, EventsByBboxArgs>
  export interface EventsByBboxArgs {
    minTime: DateTime

    maxTime: DateTime

    bbox: PreciseBBox

    date: Date

    filters?: Maybe<AreaEventsFilterInput>
  }

  export type AlertsResolver<R = Alert[], Parent = {}, TContext = {}> = Resolver<
    R,
    Parent,
    TContext,
    AlertsArgs
  >
  export interface AlertsArgs {
    time?: Maybe<string>

    language: string

    alertSearch?: Maybe<AlertSearchInput>
  }

  export type CancellationsResolver<R = Cancellation[], Parent = {}, TContext = {}> = Resolver<
    R,
    Parent,
    TContext,
    CancellationsArgs
  >
  export interface CancellationsArgs {
    date?: Maybe<Date>

    cancellationSearch?: Maybe<CancellationSearchInput>
  }

  export type UiMessageResolver<R = UiMessage, Parent = {}, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
}

export namespace EquipmentResolvers {
  export interface Resolvers<TContext = {}, TypeParent = Equipment> {
    id?: IdResolver<string, TypeParent, TContext>

    vehicleId?: VehicleIdResolver<string, TypeParent, TContext>

    operatorId?: OperatorIdResolver<string, TypeParent, TContext>

    operatorName?: OperatorNameResolver<Maybe<string>, TypeParent, TContext>

    registryNr?: RegistryNrResolver<string, TypeParent, TContext>

    age?: AgeResolver<number, TypeParent, TContext>

    type?: TypeResolver<string, TypeParent, TContext>

    exteriorColor?: ExteriorColorResolver<string, TypeParent, TContext>

    emissionDesc?: EmissionDescResolver<string, TypeParent, TContext>

    emissionClass?: EmissionClassResolver<string, TypeParent, TContext>

    inService?: InServiceResolver<Maybe<boolean>, TypeParent, TContext>

    _matchScore?: _MatchScoreResolver<Maybe<number>, TypeParent, TContext>
  }

  export type IdResolver<R = string, Parent = Equipment, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type VehicleIdResolver<R = string, Parent = Equipment, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type OperatorIdResolver<R = string, Parent = Equipment, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type OperatorNameResolver<
    R = Maybe<string>,
    Parent = Equipment,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type RegistryNrResolver<R = string, Parent = Equipment, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type AgeResolver<R = number, Parent = Equipment, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type TypeResolver<R = string, Parent = Equipment, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type ExteriorColorResolver<R = string, Parent = Equipment, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type EmissionDescResolver<R = string, Parent = Equipment, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type EmissionClassResolver<R = string, Parent = Equipment, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type InServiceResolver<
    R = Maybe<boolean>,
    Parent = Equipment,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type _MatchScoreResolver<
    R = Maybe<number>,
    Parent = Equipment,
    TContext = {}
  > = Resolver<R, Parent, TContext>
}

export namespace StopResolvers {
  export interface Resolvers<TContext = {}, TypeParent = Stop> {
    id?: IdResolver<string, TypeParent, TContext>

    stopId?: StopIdResolver<string, TypeParent, TContext>

    shortId?: ShortIdResolver<string, TypeParent, TContext>

    lat?: LatResolver<number, TypeParent, TContext>

    lng?: LngResolver<number, TypeParent, TContext>

    name?: NameResolver<Maybe<string>, TypeParent, TContext>

    radius?: RadiusResolver<Maybe<number>, TypeParent, TContext>

    routes?: RoutesResolver<StopRoute[], TypeParent, TContext>

    modes?: ModesResolver<Array<Maybe<string>>, TypeParent, TContext>

    isTimingStop?: IsTimingStopResolver<boolean, TypeParent, TContext>

    _matchScore?: _MatchScoreResolver<Maybe<number>, TypeParent, TContext>

    alerts?: AlertsResolver<Alert[], TypeParent, TContext>
  }

  export type IdResolver<R = string, Parent = Stop, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type StopIdResolver<R = string, Parent = Stop, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type ShortIdResolver<R = string, Parent = Stop, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type LatResolver<R = number, Parent = Stop, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type LngResolver<R = number, Parent = Stop, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type NameResolver<R = Maybe<string>, Parent = Stop, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type RadiusResolver<R = Maybe<number>, Parent = Stop, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type RoutesResolver<R = StopRoute[], Parent = Stop, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type ModesResolver<R = Array<Maybe<string>>, Parent = Stop, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type IsTimingStopResolver<R = boolean, Parent = Stop, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type _MatchScoreResolver<R = Maybe<number>, Parent = Stop, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type AlertsResolver<R = Alert[], Parent = Stop, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
}

export namespace StopRouteResolvers {
  export interface Resolvers<TContext = {}, TypeParent = StopRoute> {
    id?: IdResolver<string, TypeParent, TContext>

    originStopId?: OriginStopIdResolver<Maybe<string>, TypeParent, TContext>

    lineId?: LineIdResolver<Maybe<string>, TypeParent, TContext>

    routeId?: RouteIdResolver<string, TypeParent, TContext>

    direction?: DirectionResolver<Direction, TypeParent, TContext>

    isTimingStop?: IsTimingStopResolver<boolean, TypeParent, TContext>

    mode?: ModeResolver<Maybe<string>, TypeParent, TContext>
  }

  export type IdResolver<R = string, Parent = StopRoute, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type OriginStopIdResolver<
    R = Maybe<string>,
    Parent = StopRoute,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type LineIdResolver<R = Maybe<string>, Parent = StopRoute, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type RouteIdResolver<R = string, Parent = StopRoute, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type DirectionResolver<R = Direction, Parent = StopRoute, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type IsTimingStopResolver<R = boolean, Parent = StopRoute, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type ModeResolver<R = Maybe<string>, Parent = StopRoute, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
}

export namespace AlertResolvers {
  export interface Resolvers<TContext = {}, TypeParent = Alert> {
    id?: IdResolver<string, TypeParent, TContext>

    level?: LevelResolver<AlertLevel, TypeParent, TContext>

    category?: CategoryResolver<AlertCategory, TypeParent, TContext>

    distribution?: DistributionResolver<AlertDistribution, TypeParent, TContext>

    impact?: ImpactResolver<AlertImpact, TypeParent, TContext>

    affectedId?: AffectedIdResolver<string, TypeParent, TContext>

    startDateTime?: StartDateTimeResolver<DateTime, TypeParent, TContext>

    endDateTime?: EndDateTimeResolver<DateTime, TypeParent, TContext>

    lastModifiedDateTime?: LastModifiedDateTimeResolver<DateTime, TypeParent, TContext>

    title?: TitleResolver<string, TypeParent, TContext>

    description?: DescriptionResolver<string, TypeParent, TContext>

    url?: UrlResolver<Maybe<string>, TypeParent, TContext>
  }

  export type IdResolver<R = string, Parent = Alert, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type LevelResolver<R = AlertLevel, Parent = Alert, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type CategoryResolver<R = AlertCategory, Parent = Alert, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type DistributionResolver<
    R = AlertDistribution,
    Parent = Alert,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type ImpactResolver<R = AlertImpact, Parent = Alert, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type AffectedIdResolver<R = string, Parent = Alert, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type StartDateTimeResolver<R = DateTime, Parent = Alert, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type EndDateTimeResolver<R = DateTime, Parent = Alert, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type LastModifiedDateTimeResolver<
    R = DateTime,
    Parent = Alert,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type TitleResolver<R = string, Parent = Alert, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type DescriptionResolver<R = string, Parent = Alert, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type UrlResolver<R = Maybe<string>, Parent = Alert, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
}

export namespace RouteResolvers {
  export interface Resolvers<TContext = {}, TypeParent = Route> {
    id?: IdResolver<string, TypeParent, TContext>

    lineId?: LineIdResolver<string, TypeParent, TContext>

    routeId?: RouteIdResolver<string, TypeParent, TContext>

    direction?: DirectionResolver<Direction, TypeParent, TContext>

    destination?: DestinationResolver<Maybe<string>, TypeParent, TContext>

    origin?: OriginResolver<Maybe<string>, TypeParent, TContext>

    name?: NameResolver<Maybe<string>, TypeParent, TContext>

    destinationStopId?: DestinationStopIdResolver<Maybe<string>, TypeParent, TContext>

    originStopId?: OriginStopIdResolver<string, TypeParent, TContext>

    mode?: ModeResolver<Maybe<string>, TypeParent, TContext>

    alerts?: AlertsResolver<Alert[], TypeParent, TContext>

    cancellations?: CancellationsResolver<Cancellation[], TypeParent, TContext>

    _matchScore?: _MatchScoreResolver<Maybe<number>, TypeParent, TContext>
  }

  export type IdResolver<R = string, Parent = Route, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type LineIdResolver<R = string, Parent = Route, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type RouteIdResolver<R = string, Parent = Route, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type DirectionResolver<R = Direction, Parent = Route, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type DestinationResolver<R = Maybe<string>, Parent = Route, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type OriginResolver<R = Maybe<string>, Parent = Route, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type NameResolver<R = Maybe<string>, Parent = Route, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type DestinationStopIdResolver<
    R = Maybe<string>,
    Parent = Route,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type OriginStopIdResolver<R = string, Parent = Route, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type ModeResolver<R = Maybe<string>, Parent = Route, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type AlertsResolver<R = Alert[], Parent = Route, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type CancellationsResolver<
    R = Cancellation[],
    Parent = Route,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type _MatchScoreResolver<R = Maybe<number>, Parent = Route, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
}

export namespace CancellationResolvers {
  export interface Resolvers<TContext = {}, TypeParent = Cancellation> {
    id?: IdResolver<number, TypeParent, TContext>

    routeId?: RouteIdResolver<string, TypeParent, TContext>

    direction?: DirectionResolver<Direction, TypeParent, TContext>

    departureDate?: DepartureDateResolver<Date, TypeParent, TContext>

    journeyStartTime?: JourneyStartTimeResolver<Time, TypeParent, TContext>

    title?: TitleResolver<string, TypeParent, TContext>

    description?: DescriptionResolver<string, TypeParent, TContext>

    category?: CategoryResolver<AlertCategory, TypeParent, TContext>

    subCategory?: SubCategoryResolver<CancellationSubcategory, TypeParent, TContext>

    isCancelled?: IsCancelledResolver<boolean, TypeParent, TContext>

    cancellationType?: CancellationTypeResolver<CancellationType, TypeParent, TContext>

    cancellationEffect?: CancellationEffectResolver<CancellationEffect, TypeParent, TContext>

    lastModifiedDateTime?: LastModifiedDateTimeResolver<DateTime, TypeParent, TContext>
  }

  export type IdResolver<R = number, Parent = Cancellation, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type RouteIdResolver<R = string, Parent = Cancellation, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type DirectionResolver<
    R = Direction,
    Parent = Cancellation,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type DepartureDateResolver<R = Date, Parent = Cancellation, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type JourneyStartTimeResolver<
    R = Time,
    Parent = Cancellation,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type TitleResolver<R = string, Parent = Cancellation, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type DescriptionResolver<R = string, Parent = Cancellation, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type CategoryResolver<
    R = AlertCategory,
    Parent = Cancellation,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type SubCategoryResolver<
    R = CancellationSubcategory,
    Parent = Cancellation,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type IsCancelledResolver<
    R = boolean,
    Parent = Cancellation,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type CancellationTypeResolver<
    R = CancellationType,
    Parent = Cancellation,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type CancellationEffectResolver<
    R = CancellationEffect,
    Parent = Cancellation,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type LastModifiedDateTimeResolver<
    R = DateTime,
    Parent = Cancellation,
    TContext = {}
  > = Resolver<R, Parent, TContext>
}

export namespace RouteGeometryResolvers {
  export interface Resolvers<TContext = {}, TypeParent = RouteGeometry> {
    id?: IdResolver<string, TypeParent, TContext>

    mode?: ModeResolver<Maybe<string>, TypeParent, TContext>

    coordinates?: CoordinatesResolver<RouteGeometryPoint[], TypeParent, TContext>
  }

  export type IdResolver<R = string, Parent = RouteGeometry, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type ModeResolver<
    R = Maybe<string>,
    Parent = RouteGeometry,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type CoordinatesResolver<
    R = RouteGeometryPoint[],
    Parent = RouteGeometry,
    TContext = {}
  > = Resolver<R, Parent, TContext>
}

export namespace RouteGeometryPointResolvers {
  export interface Resolvers<TContext = {}, TypeParent = RouteGeometryPoint> {
    lat?: LatResolver<number, TypeParent, TContext>

    lng?: LngResolver<number, TypeParent, TContext>
  }

  export type LatResolver<R = number, Parent = RouteGeometryPoint, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type LngResolver<R = number, Parent = RouteGeometryPoint, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
}

export namespace RouteSegmentResolvers {
  export interface Resolvers<TContext = {}, TypeParent = RouteSegment> {
    id?: IdResolver<string, TypeParent, TContext>

    lineId?: LineIdResolver<Maybe<string>, TypeParent, TContext>

    routeId?: RouteIdResolver<string, TypeParent, TContext>

    direction?: DirectionResolver<Direction, TypeParent, TContext>

    originStopId?: OriginStopIdResolver<Maybe<string>, TypeParent, TContext>

    destination?: DestinationResolver<string, TypeParent, TContext>

    distanceFromPrevious?: DistanceFromPreviousResolver<Maybe<number>, TypeParent, TContext>

    distanceFromStart?: DistanceFromStartResolver<Maybe<number>, TypeParent, TContext>

    duration?: DurationResolver<Maybe<number>, TypeParent, TContext>

    stopIndex?: StopIndexResolver<number, TypeParent, TContext>

    isTimingStop?: IsTimingStopResolver<boolean, TypeParent, TContext>

    stopId?: StopIdResolver<string, TypeParent, TContext>

    shortId?: ShortIdResolver<string, TypeParent, TContext>

    lat?: LatResolver<number, TypeParent, TContext>

    lng?: LngResolver<number, TypeParent, TContext>

    name?: NameResolver<Maybe<string>, TypeParent, TContext>

    radius?: RadiusResolver<Maybe<number>, TypeParent, TContext>

    modes?: ModesResolver<Array<Maybe<string>>, TypeParent, TContext>

    alerts?: AlertsResolver<Alert[], TypeParent, TContext>

    cancellations?: CancellationsResolver<Cancellation[], TypeParent, TContext>
  }

  export type IdResolver<R = string, Parent = RouteSegment, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type LineIdResolver<
    R = Maybe<string>,
    Parent = RouteSegment,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type RouteIdResolver<R = string, Parent = RouteSegment, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type DirectionResolver<
    R = Direction,
    Parent = RouteSegment,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type OriginStopIdResolver<
    R = Maybe<string>,
    Parent = RouteSegment,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type DestinationResolver<R = string, Parent = RouteSegment, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type DistanceFromPreviousResolver<
    R = Maybe<number>,
    Parent = RouteSegment,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type DistanceFromStartResolver<
    R = Maybe<number>,
    Parent = RouteSegment,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type DurationResolver<
    R = Maybe<number>,
    Parent = RouteSegment,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type StopIndexResolver<R = number, Parent = RouteSegment, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type IsTimingStopResolver<
    R = boolean,
    Parent = RouteSegment,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type StopIdResolver<R = string, Parent = RouteSegment, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type ShortIdResolver<R = string, Parent = RouteSegment, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type LatResolver<R = number, Parent = RouteSegment, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type LngResolver<R = number, Parent = RouteSegment, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type NameResolver<R = Maybe<string>, Parent = RouteSegment, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type RadiusResolver<
    R = Maybe<number>,
    Parent = RouteSegment,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type ModesResolver<
    R = Array<Maybe<string>>,
    Parent = RouteSegment,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type AlertsResolver<R = Alert[], Parent = RouteSegment, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type CancellationsResolver<
    R = Cancellation[],
    Parent = RouteSegment,
    TContext = {}
  > = Resolver<R, Parent, TContext>
}

export namespace LineResolvers {
  export interface Resolvers<TContext = {}, TypeParent = Line> {
    id?: IdResolver<string, TypeParent, TContext>

    lineId?: LineIdResolver<string, TypeParent, TContext>

    name?: NameResolver<Maybe<string>, TypeParent, TContext>

    routesCount?: RoutesCountResolver<Maybe<number>, TypeParent, TContext>

    _matchScore?: _MatchScoreResolver<Maybe<number>, TypeParent, TContext>
  }

  export type IdResolver<R = string, Parent = Line, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type LineIdResolver<R = string, Parent = Line, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type NameResolver<R = Maybe<string>, Parent = Line, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type RoutesCountResolver<R = Maybe<number>, Parent = Line, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type _MatchScoreResolver<R = Maybe<number>, Parent = Line, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
}

export namespace DepartureResolvers {
  export interface Resolvers<TContext = {}, TypeParent = Departure> {
    id?: IdResolver<string, TypeParent, TContext>

    stopId?: StopIdResolver<string, TypeParent, TContext>

    dayType?: DayTypeResolver<string, TypeParent, TContext>

    equipmentType?: EquipmentTypeResolver<Maybe<string>, TypeParent, TContext>

    equipmentIsRequired?: EquipmentIsRequiredResolver<Maybe<boolean>, TypeParent, TContext>

    equipmentColor?: EquipmentColorResolver<Maybe<string>, TypeParent, TContext>

    operatorId?: OperatorIdResolver<Maybe<string>, TypeParent, TContext>

    routeId?: RouteIdResolver<string, TypeParent, TContext>

    direction?: DirectionResolver<Direction, TypeParent, TContext>

    terminalTime?: TerminalTimeResolver<Maybe<number>, TypeParent, TContext>

    recoveryTime?: RecoveryTimeResolver<Maybe<number>, TypeParent, TContext>

    departureId?: DepartureIdResolver<number, TypeParent, TContext>

    departureTime?: DepartureTimeResolver<Time, TypeParent, TContext>

    departureDate?: DepartureDateResolver<Date, TypeParent, TContext>

    extraDeparture?: ExtraDepartureResolver<string, TypeParent, TContext>

    isNextDay?: IsNextDayResolver<boolean, TypeParent, TContext>

    isTimingStop?: IsTimingStopResolver<boolean, TypeParent, TContext>

    index?: IndexResolver<Maybe<number>, TypeParent, TContext>

    mode?: ModeResolver<string, TypeParent, TContext>

    stop?: StopResolver<Stop, TypeParent, TContext>

    journey?: JourneyResolver<Maybe<DepartureJourney>, TypeParent, TContext>

    alerts?: AlertsResolver<Alert[], TypeParent, TContext>

    cancellations?: CancellationsResolver<Cancellation[], TypeParent, TContext>

    isCancelled?: IsCancelledResolver<boolean, TypeParent, TContext>

    isOrigin?: IsOriginResolver<Maybe<boolean>, TypeParent, TContext>

    departureEvent?: DepartureEventResolver<Maybe<JourneyStopEvent>, TypeParent, TContext>

    originDepartureTime?: OriginDepartureTimeResolver<
      Maybe<PlannedDeparture>,
      TypeParent,
      TContext
    >

    plannedArrivalTime?: PlannedArrivalTimeResolver<PlannedArrival, TypeParent, TContext>

    observedArrivalTime?: ObservedArrivalTimeResolver<
      Maybe<ObservedArrival>,
      TypeParent,
      TContext
    >

    plannedDepartureTime?: PlannedDepartureTimeResolver<PlannedDeparture, TypeParent, TContext>

    observedDepartureTime?: ObservedDepartureTimeResolver<
      Maybe<ObservedDeparture>,
      TypeParent,
      TContext
    >
  }

  export type IdResolver<R = string, Parent = Departure, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type StopIdResolver<R = string, Parent = Departure, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type DayTypeResolver<R = string, Parent = Departure, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type EquipmentTypeResolver<
    R = Maybe<string>,
    Parent = Departure,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type EquipmentIsRequiredResolver<
    R = Maybe<boolean>,
    Parent = Departure,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type EquipmentColorResolver<
    R = Maybe<string>,
    Parent = Departure,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type OperatorIdResolver<
    R = Maybe<string>,
    Parent = Departure,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type RouteIdResolver<R = string, Parent = Departure, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type DirectionResolver<R = Direction, Parent = Departure, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type TerminalTimeResolver<
    R = Maybe<number>,
    Parent = Departure,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type RecoveryTimeResolver<
    R = Maybe<number>,
    Parent = Departure,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type DepartureIdResolver<R = number, Parent = Departure, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type DepartureTimeResolver<R = Time, Parent = Departure, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type DepartureDateResolver<R = Date, Parent = Departure, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type ExtraDepartureResolver<R = string, Parent = Departure, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type IsNextDayResolver<R = boolean, Parent = Departure, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type IsTimingStopResolver<R = boolean, Parent = Departure, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type IndexResolver<R = Maybe<number>, Parent = Departure, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type ModeResolver<R = string, Parent = Departure, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type StopResolver<R = Stop, Parent = Departure, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type JourneyResolver<
    R = Maybe<DepartureJourney>,
    Parent = Departure,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type AlertsResolver<R = Alert[], Parent = Departure, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type CancellationsResolver<
    R = Cancellation[],
    Parent = Departure,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type IsCancelledResolver<R = boolean, Parent = Departure, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type IsOriginResolver<
    R = Maybe<boolean>,
    Parent = Departure,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type DepartureEventResolver<
    R = Maybe<JourneyStopEvent>,
    Parent = Departure,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type OriginDepartureTimeResolver<
    R = Maybe<PlannedDeparture>,
    Parent = Departure,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type PlannedArrivalTimeResolver<
    R = PlannedArrival,
    Parent = Departure,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type ObservedArrivalTimeResolver<
    R = Maybe<ObservedArrival>,
    Parent = Departure,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type PlannedDepartureTimeResolver<
    R = PlannedDeparture,
    Parent = Departure,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type ObservedDepartureTimeResolver<
    R = Maybe<ObservedDeparture>,
    Parent = Departure,
    TContext = {}
  > = Resolver<R, Parent, TContext>
}

export namespace DepartureJourneyResolvers {
  export interface Resolvers<TContext = {}, TypeParent = DepartureJourney> {
    id?: IdResolver<string, TypeParent, TContext>

    type?: TypeResolver<string, TypeParent, TContext>

    lineId?: LineIdResolver<Maybe<string>, TypeParent, TContext>

    routeId?: RouteIdResolver<string, TypeParent, TContext>

    direction?: DirectionResolver<Direction, TypeParent, TContext>

    originStopId?: OriginStopIdResolver<Maybe<string>, TypeParent, TContext>

    departureDate?: DepartureDateResolver<Date, TypeParent, TContext>

    departureTime?: DepartureTimeResolver<Time, TypeParent, TContext>

    uniqueVehicleId?: UniqueVehicleIdResolver<Maybe<VehicleId>, TypeParent, TContext>

    mode?: ModeResolver<Maybe<string>, TypeParent, TContext>

    events?: EventsResolver<Maybe<VehiclePosition[]>, TypeParent, TContext>

    alerts?: AlertsResolver<Alert[], TypeParent, TContext>

    cancellations?: CancellationsResolver<Cancellation[], TypeParent, TContext>

    isCancelled?: IsCancelledResolver<boolean, TypeParent, TContext>

    _numInstance?: _NumInstanceResolver<Maybe<number>, TypeParent, TContext>
  }

  export type IdResolver<R = string, Parent = DepartureJourney, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type TypeResolver<R = string, Parent = DepartureJourney, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type LineIdResolver<
    R = Maybe<string>,
    Parent = DepartureJourney,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type RouteIdResolver<R = string, Parent = DepartureJourney, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type DirectionResolver<
    R = Direction,
    Parent = DepartureJourney,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type OriginStopIdResolver<
    R = Maybe<string>,
    Parent = DepartureJourney,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type DepartureDateResolver<
    R = Date,
    Parent = DepartureJourney,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type DepartureTimeResolver<
    R = Time,
    Parent = DepartureJourney,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type UniqueVehicleIdResolver<
    R = Maybe<VehicleId>,
    Parent = DepartureJourney,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type ModeResolver<
    R = Maybe<string>,
    Parent = DepartureJourney,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type EventsResolver<
    R = Maybe<VehiclePosition[]>,
    Parent = DepartureJourney,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type AlertsResolver<R = Alert[], Parent = DepartureJourney, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type CancellationsResolver<
    R = Cancellation[],
    Parent = DepartureJourney,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type IsCancelledResolver<
    R = boolean,
    Parent = DepartureJourney,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type _NumInstanceResolver<
    R = Maybe<number>,
    Parent = DepartureJourney,
    TContext = {}
  > = Resolver<R, Parent, TContext>
}

export namespace VehiclePositionResolvers {
  export interface Resolvers<TContext = {}, TypeParent = VehiclePosition> {
    id?: IdResolver<string, TypeParent, TContext>

    journeyType?: JourneyTypeResolver<string, TypeParent, TContext>

    recordedAt?: RecordedAtResolver<DateTime, TypeParent, TContext>

    recordedAtUnix?: RecordedAtUnixResolver<number, TypeParent, TContext>

    recordedTime?: RecordedTimeResolver<Time, TypeParent, TContext>

    stop?: StopResolver<Maybe<string>, TypeParent, TContext>

    nextStopId?: NextStopIdResolver<Maybe<string>, TypeParent, TContext>

    lat?: LatResolver<Maybe<number>, TypeParent, TContext>

    lng?: LngResolver<Maybe<number>, TypeParent, TContext>

    velocity?: VelocityResolver<Maybe<number>, TypeParent, TContext>

    doorStatus?: DoorStatusResolver<Maybe<boolean>, TypeParent, TContext>

    delay?: DelayResolver<Maybe<number>, TypeParent, TContext>

    heading?: HeadingResolver<Maybe<number>, TypeParent, TContext>
  }

  export type IdResolver<R = string, Parent = VehiclePosition, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type JourneyTypeResolver<
    R = string,
    Parent = VehiclePosition,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type RecordedAtResolver<
    R = DateTime,
    Parent = VehiclePosition,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type RecordedAtUnixResolver<
    R = number,
    Parent = VehiclePosition,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type RecordedTimeResolver<
    R = Time,
    Parent = VehiclePosition,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type StopResolver<
    R = Maybe<string>,
    Parent = VehiclePosition,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type NextStopIdResolver<
    R = Maybe<string>,
    Parent = VehiclePosition,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type LatResolver<
    R = Maybe<number>,
    Parent = VehiclePosition,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type LngResolver<
    R = Maybe<number>,
    Parent = VehiclePosition,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type VelocityResolver<
    R = Maybe<number>,
    Parent = VehiclePosition,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type DoorStatusResolver<
    R = Maybe<boolean>,
    Parent = VehiclePosition,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type DelayResolver<
    R = Maybe<number>,
    Parent = VehiclePosition,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type HeadingResolver<
    R = Maybe<number>,
    Parent = VehiclePosition,
    TContext = {}
  > = Resolver<R, Parent, TContext>
}

export namespace JourneyStopEventResolvers {
  export interface Resolvers<TContext = {}, TypeParent = JourneyStopEvent> {
    id?: IdResolver<string, TypeParent, TContext>

    type?: TypeResolver<string, TypeParent, TContext>

    recordedAt?: RecordedAtResolver<DateTime, TypeParent, TContext>

    recordedAtUnix?: RecordedAtUnixResolver<number, TypeParent, TContext>

    recordedTime?: RecordedTimeResolver<Time, TypeParent, TContext>

    nextStopId?: NextStopIdResolver<string, TypeParent, TContext>

    stopId?: StopIdResolver<Maybe<string>, TypeParent, TContext>

    doorsOpened?: DoorsOpenedResolver<Maybe<boolean>, TypeParent, TContext>

    stopped?: StoppedResolver<Maybe<boolean>, TypeParent, TContext>

    plannedDate?: PlannedDateResolver<Maybe<Date>, TypeParent, TContext>

    plannedTime?: PlannedTimeResolver<Maybe<Time>, TypeParent, TContext>

    plannedDateTime?: PlannedDateTimeResolver<Maybe<DateTime>, TypeParent, TContext>

    plannedTimeDifference?: PlannedTimeDifferenceResolver<Maybe<number>, TypeParent, TContext>

    isNextDay?: IsNextDayResolver<Maybe<boolean>, TypeParent, TContext>

    departureId?: DepartureIdResolver<Maybe<number>, TypeParent, TContext>

    isTimingStop?: IsTimingStopResolver<boolean, TypeParent, TContext>

    isOrigin?: IsOriginResolver<Maybe<boolean>, TypeParent, TContext>

    index?: IndexResolver<Maybe<number>, TypeParent, TContext>

    stop?: StopResolver<Maybe<Stop>, TypeParent, TContext>

    unplannedStop?: UnplannedStopResolver<boolean, TypeParent, TContext>
  }

  export type IdResolver<R = string, Parent = JourneyStopEvent, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type TypeResolver<R = string, Parent = JourneyStopEvent, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type RecordedAtResolver<
    R = DateTime,
    Parent = JourneyStopEvent,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type RecordedAtUnixResolver<
    R = number,
    Parent = JourneyStopEvent,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type RecordedTimeResolver<
    R = Time,
    Parent = JourneyStopEvent,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type NextStopIdResolver<
    R = string,
    Parent = JourneyStopEvent,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type StopIdResolver<
    R = Maybe<string>,
    Parent = JourneyStopEvent,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type DoorsOpenedResolver<
    R = Maybe<boolean>,
    Parent = JourneyStopEvent,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type StoppedResolver<
    R = Maybe<boolean>,
    Parent = JourneyStopEvent,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type PlannedDateResolver<
    R = Maybe<Date>,
    Parent = JourneyStopEvent,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type PlannedTimeResolver<
    R = Maybe<Time>,
    Parent = JourneyStopEvent,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type PlannedDateTimeResolver<
    R = Maybe<DateTime>,
    Parent = JourneyStopEvent,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type PlannedTimeDifferenceResolver<
    R = Maybe<number>,
    Parent = JourneyStopEvent,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type IsNextDayResolver<
    R = Maybe<boolean>,
    Parent = JourneyStopEvent,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type DepartureIdResolver<
    R = Maybe<number>,
    Parent = JourneyStopEvent,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type IsTimingStopResolver<
    R = boolean,
    Parent = JourneyStopEvent,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type IsOriginResolver<
    R = Maybe<boolean>,
    Parent = JourneyStopEvent,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type IndexResolver<
    R = Maybe<number>,
    Parent = JourneyStopEvent,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type StopResolver<
    R = Maybe<Stop>,
    Parent = JourneyStopEvent,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type UnplannedStopResolver<
    R = boolean,
    Parent = JourneyStopEvent,
    TContext = {}
  > = Resolver<R, Parent, TContext>
}

export namespace PlannedDepartureResolvers {
  export interface Resolvers<TContext = {}, TypeParent = PlannedDeparture> {
    id?: IdResolver<string, TypeParent, TContext>

    departureDate?: DepartureDateResolver<Date, TypeParent, TContext>

    departureTime?: DepartureTimeResolver<Time, TypeParent, TContext>

    departureDateTime?: DepartureDateTimeResolver<DateTime, TypeParent, TContext>

    isNextDay?: IsNextDayResolver<Maybe<boolean>, TypeParent, TContext>
  }

  export type IdResolver<R = string, Parent = PlannedDeparture, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type DepartureDateResolver<
    R = Date,
    Parent = PlannedDeparture,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type DepartureTimeResolver<
    R = Time,
    Parent = PlannedDeparture,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type DepartureDateTimeResolver<
    R = DateTime,
    Parent = PlannedDeparture,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type IsNextDayResolver<
    R = Maybe<boolean>,
    Parent = PlannedDeparture,
    TContext = {}
  > = Resolver<R, Parent, TContext>
}

export namespace PlannedArrivalResolvers {
  export interface Resolvers<TContext = {}, TypeParent = PlannedArrival> {
    id?: IdResolver<string, TypeParent, TContext>

    arrivalDate?: ArrivalDateResolver<Date, TypeParent, TContext>

    arrivalTime?: ArrivalTimeResolver<Time, TypeParent, TContext>

    arrivalDateTime?: ArrivalDateTimeResolver<DateTime, TypeParent, TContext>

    isNextDay?: IsNextDayResolver<Maybe<boolean>, TypeParent, TContext>
  }

  export type IdResolver<R = string, Parent = PlannedArrival, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type ArrivalDateResolver<R = Date, Parent = PlannedArrival, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type ArrivalTimeResolver<R = Time, Parent = PlannedArrival, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type ArrivalDateTimeResolver<
    R = DateTime,
    Parent = PlannedArrival,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type IsNextDayResolver<
    R = Maybe<boolean>,
    Parent = PlannedArrival,
    TContext = {}
  > = Resolver<R, Parent, TContext>
}

export namespace ObservedArrivalResolvers {
  export interface Resolvers<TContext = {}, TypeParent = ObservedArrival> {
    id?: IdResolver<string, TypeParent, TContext>

    arrivalDate?: ArrivalDateResolver<Date, TypeParent, TContext>

    arrivalTime?: ArrivalTimeResolver<Time, TypeParent, TContext>

    arrivalDateTime?: ArrivalDateTimeResolver<DateTime, TypeParent, TContext>

    arrivalTimeDifference?: ArrivalTimeDifferenceResolver<number, TypeParent, TContext>
  }

  export type IdResolver<R = string, Parent = ObservedArrival, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type ArrivalDateResolver<
    R = Date,
    Parent = ObservedArrival,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type ArrivalTimeResolver<
    R = Time,
    Parent = ObservedArrival,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type ArrivalDateTimeResolver<
    R = DateTime,
    Parent = ObservedArrival,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type ArrivalTimeDifferenceResolver<
    R = number,
    Parent = ObservedArrival,
    TContext = {}
  > = Resolver<R, Parent, TContext>
}

export namespace ObservedDepartureResolvers {
  export interface Resolvers<TContext = {}, TypeParent = ObservedDeparture> {
    id?: IdResolver<string, TypeParent, TContext>

    departureDate?: DepartureDateResolver<Date, TypeParent, TContext>

    departureTime?: DepartureTimeResolver<Time, TypeParent, TContext>

    departureDateTime?: DepartureDateTimeResolver<DateTime, TypeParent, TContext>

    departureTimeDifference?: DepartureTimeDifferenceResolver<number, TypeParent, TContext>
  }

  export type IdResolver<R = string, Parent = ObservedDeparture, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type DepartureDateResolver<
    R = Date,
    Parent = ObservedDeparture,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type DepartureTimeResolver<
    R = Time,
    Parent = ObservedDeparture,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type DepartureDateTimeResolver<
    R = DateTime,
    Parent = ObservedDeparture,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type DepartureTimeDifferenceResolver<
    R = number,
    Parent = ObservedDeparture,
    TContext = {}
  > = Resolver<R, Parent, TContext>
}

export namespace ExceptionDayResolvers {
  export interface Resolvers<TContext = {}, TypeParent = ExceptionDay> {
    id?: IdResolver<string, TypeParent, TContext>

    exceptionDate?: ExceptionDateResolver<Date, TypeParent, TContext>

    effectiveDayTypes?: EffectiveDayTypesResolver<string[], TypeParent, TContext>

    dayType?: DayTypeResolver<string, TypeParent, TContext>

    modeScope?: ModeScopeResolver<Maybe<string>, TypeParent, TContext>

    description?: DescriptionResolver<Maybe<string>, TypeParent, TContext>

    exclusive?: ExclusiveResolver<boolean, TypeParent, TContext>

    startTime?: StartTimeResolver<Maybe<Time>, TypeParent, TContext>

    endTime?: EndTimeResolver<Maybe<Time>, TypeParent, TContext>
  }

  export type IdResolver<R = string, Parent = ExceptionDay, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type ExceptionDateResolver<R = Date, Parent = ExceptionDay, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type EffectiveDayTypesResolver<
    R = string[],
    Parent = ExceptionDay,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type DayTypeResolver<R = string, Parent = ExceptionDay, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type ModeScopeResolver<
    R = Maybe<string>,
    Parent = ExceptionDay,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type DescriptionResolver<
    R = Maybe<string>,
    Parent = ExceptionDay,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type ExclusiveResolver<R = boolean, Parent = ExceptionDay, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type StartTimeResolver<
    R = Maybe<Time>,
    Parent = ExceptionDay,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type EndTimeResolver<
    R = Maybe<Time>,
    Parent = ExceptionDay,
    TContext = {}
  > = Resolver<R, Parent, TContext>
}

export namespace JourneyResolvers {
  export interface Resolvers<TContext = {}, TypeParent = Journey> {
    id?: IdResolver<string, TypeParent, TContext>

    lineId?: LineIdResolver<Maybe<string>, TypeParent, TContext>

    routeId?: RouteIdResolver<string, TypeParent, TContext>

    direction?: DirectionResolver<Direction, TypeParent, TContext>

    originStopId?: OriginStopIdResolver<Maybe<string>, TypeParent, TContext>

    departureDate?: DepartureDateResolver<Date, TypeParent, TContext>

    departureTime?: DepartureTimeResolver<Time, TypeParent, TContext>

    uniqueVehicleId?: UniqueVehicleIdResolver<Maybe<VehicleId>, TypeParent, TContext>

    operatorId?: OperatorIdResolver<Maybe<string>, TypeParent, TContext>

    vehicleId?: VehicleIdResolver<Maybe<string>, TypeParent, TContext>

    headsign?: HeadsignResolver<Maybe<string>, TypeParent, TContext>

    name?: NameResolver<Maybe<string>, TypeParent, TContext>

    mode?: ModeResolver<Maybe<string>, TypeParent, TContext>

    equipment?: EquipmentResolver<Maybe<Equipment>, TypeParent, TContext>

    vehiclePositions?: VehiclePositionsResolver<VehiclePosition[], TypeParent, TContext>

    events?: EventsResolver<JourneyEventType[], TypeParent, TContext>

    departure?: DepartureResolver<Maybe<Departure>, TypeParent, TContext>

    alerts?: AlertsResolver<Alert[], TypeParent, TContext>

    cancellations?: CancellationsResolver<Cancellation[], TypeParent, TContext>

    isCancelled?: IsCancelledResolver<boolean, TypeParent, TContext>
  }

  export type IdResolver<R = string, Parent = Journey, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type LineIdResolver<R = Maybe<string>, Parent = Journey, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type RouteIdResolver<R = string, Parent = Journey, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type DirectionResolver<R = Direction, Parent = Journey, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type OriginStopIdResolver<
    R = Maybe<string>,
    Parent = Journey,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type DepartureDateResolver<R = Date, Parent = Journey, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type DepartureTimeResolver<R = Time, Parent = Journey, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type UniqueVehicleIdResolver<
    R = Maybe<VehicleId>,
    Parent = Journey,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type OperatorIdResolver<
    R = Maybe<string>,
    Parent = Journey,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type VehicleIdResolver<R = Maybe<string>, Parent = Journey, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type HeadsignResolver<R = Maybe<string>, Parent = Journey, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type NameResolver<R = Maybe<string>, Parent = Journey, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type ModeResolver<R = Maybe<string>, Parent = Journey, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type EquipmentResolver<
    R = Maybe<Equipment>,
    Parent = Journey,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type VehiclePositionsResolver<
    R = VehiclePosition[],
    Parent = Journey,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type EventsResolver<
    R = JourneyEventType[],
    Parent = Journey,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type DepartureResolver<
    R = Maybe<Departure>,
    Parent = Journey,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type AlertsResolver<R = Alert[], Parent = Journey, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type CancellationsResolver<
    R = Cancellation[],
    Parent = Journey,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type IsCancelledResolver<R = boolean, Parent = Journey, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
}

export namespace JourneyEventResolvers {
  export interface Resolvers<TContext = {}, TypeParent = JourneyEvent> {
    id?: IdResolver<string, TypeParent, TContext>

    type?: TypeResolver<string, TypeParent, TContext>

    recordedAt?: RecordedAtResolver<DateTime, TypeParent, TContext>

    recordedAtUnix?: RecordedAtUnixResolver<number, TypeParent, TContext>

    recordedTime?: RecordedTimeResolver<Time, TypeParent, TContext>

    stopId?: StopIdResolver<Maybe<string>, TypeParent, TContext>
  }

  export type IdResolver<R = string, Parent = JourneyEvent, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type TypeResolver<R = string, Parent = JourneyEvent, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type RecordedAtResolver<
    R = DateTime,
    Parent = JourneyEvent,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type RecordedAtUnixResolver<
    R = number,
    Parent = JourneyEvent,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type RecordedTimeResolver<R = Time, Parent = JourneyEvent, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type StopIdResolver<
    R = Maybe<string>,
    Parent = JourneyEvent,
    TContext = {}
  > = Resolver<R, Parent, TContext>
}

export namespace JourneyCancellationEventResolvers {
  export interface Resolvers<TContext = {}, TypeParent = JourneyCancellationEvent> {
    id?: IdResolver<string, TypeParent, TContext>

    type?: TypeResolver<string, TypeParent, TContext>

    recordedAt?: RecordedAtResolver<DateTime, TypeParent, TContext>

    recordedAtUnix?: RecordedAtUnixResolver<number, TypeParent, TContext>

    recordedTime?: RecordedTimeResolver<Time, TypeParent, TContext>

    plannedDate?: PlannedDateResolver<Maybe<Date>, TypeParent, TContext>

    plannedTime?: PlannedTimeResolver<Maybe<Time>, TypeParent, TContext>

    title?: TitleResolver<string, TypeParent, TContext>

    description?: DescriptionResolver<string, TypeParent, TContext>

    category?: CategoryResolver<AlertCategory, TypeParent, TContext>

    subCategory?: SubCategoryResolver<CancellationSubcategory, TypeParent, TContext>

    isCancelled?: IsCancelledResolver<boolean, TypeParent, TContext>

    cancellationType?: CancellationTypeResolver<CancellationType, TypeParent, TContext>

    cancellationEffect?: CancellationEffectResolver<CancellationEffect, TypeParent, TContext>
  }

  export type IdResolver<
    R = string,
    Parent = JourneyCancellationEvent,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type TypeResolver<
    R = string,
    Parent = JourneyCancellationEvent,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type RecordedAtResolver<
    R = DateTime,
    Parent = JourneyCancellationEvent,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type RecordedAtUnixResolver<
    R = number,
    Parent = JourneyCancellationEvent,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type RecordedTimeResolver<
    R = Time,
    Parent = JourneyCancellationEvent,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type PlannedDateResolver<
    R = Maybe<Date>,
    Parent = JourneyCancellationEvent,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type PlannedTimeResolver<
    R = Maybe<Time>,
    Parent = JourneyCancellationEvent,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type TitleResolver<
    R = string,
    Parent = JourneyCancellationEvent,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type DescriptionResolver<
    R = string,
    Parent = JourneyCancellationEvent,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type CategoryResolver<
    R = AlertCategory,
    Parent = JourneyCancellationEvent,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type SubCategoryResolver<
    R = CancellationSubcategory,
    Parent = JourneyCancellationEvent,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type IsCancelledResolver<
    R = boolean,
    Parent = JourneyCancellationEvent,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type CancellationTypeResolver<
    R = CancellationType,
    Parent = JourneyCancellationEvent,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type CancellationEffectResolver<
    R = CancellationEffect,
    Parent = JourneyCancellationEvent,
    TContext = {}
  > = Resolver<R, Parent, TContext>
}

export namespace PlannedStopEventResolvers {
  export interface Resolvers<TContext = {}, TypeParent = PlannedStopEvent> {
    id?: IdResolver<string, TypeParent, TContext>

    type?: TypeResolver<string, TypeParent, TContext>

    stopId?: StopIdResolver<Maybe<string>, TypeParent, TContext>

    plannedDate?: PlannedDateResolver<Maybe<Date>, TypeParent, TContext>

    plannedTime?: PlannedTimeResolver<Maybe<Time>, TypeParent, TContext>

    plannedDateTime?: PlannedDateTimeResolver<Maybe<DateTime>, TypeParent, TContext>

    isNextDay?: IsNextDayResolver<Maybe<boolean>, TypeParent, TContext>

    departureId?: DepartureIdResolver<Maybe<number>, TypeParent, TContext>

    isTimingStop?: IsTimingStopResolver<boolean, TypeParent, TContext>

    isOrigin?: IsOriginResolver<Maybe<boolean>, TypeParent, TContext>

    index?: IndexResolver<Maybe<number>, TypeParent, TContext>

    stop?: StopResolver<Maybe<Stop>, TypeParent, TContext>
  }

  export type IdResolver<R = string, Parent = PlannedStopEvent, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type TypeResolver<R = string, Parent = PlannedStopEvent, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type StopIdResolver<
    R = Maybe<string>,
    Parent = PlannedStopEvent,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type PlannedDateResolver<
    R = Maybe<Date>,
    Parent = PlannedStopEvent,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type PlannedTimeResolver<
    R = Maybe<Time>,
    Parent = PlannedStopEvent,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type PlannedDateTimeResolver<
    R = Maybe<DateTime>,
    Parent = PlannedStopEvent,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type IsNextDayResolver<
    R = Maybe<boolean>,
    Parent = PlannedStopEvent,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type DepartureIdResolver<
    R = Maybe<number>,
    Parent = PlannedStopEvent,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type IsTimingStopResolver<
    R = boolean,
    Parent = PlannedStopEvent,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type IsOriginResolver<
    R = Maybe<boolean>,
    Parent = PlannedStopEvent,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type IndexResolver<
    R = Maybe<number>,
    Parent = PlannedStopEvent,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type StopResolver<
    R = Maybe<Stop>,
    Parent = PlannedStopEvent,
    TContext = {}
  > = Resolver<R, Parent, TContext>
}

export namespace VehicleJourneyResolvers {
  export interface Resolvers<TContext = {}, TypeParent = VehicleJourney> {
    id?: IdResolver<string, TypeParent, TContext>

    lineId?: LineIdResolver<Maybe<string>, TypeParent, TContext>

    routeId?: RouteIdResolver<string, TypeParent, TContext>

    direction?: DirectionResolver<Direction, TypeParent, TContext>

    originStopId?: OriginStopIdResolver<Maybe<string>, TypeParent, TContext>

    departureDate?: DepartureDateResolver<Date, TypeParent, TContext>

    departureTime?: DepartureTimeResolver<Time, TypeParent, TContext>

    uniqueVehicleId?: UniqueVehicleIdResolver<Maybe<VehicleId>, TypeParent, TContext>

    operatorId?: OperatorIdResolver<Maybe<string>, TypeParent, TContext>

    vehicleId?: VehicleIdResolver<Maybe<string>, TypeParent, TContext>

    headsign?: HeadsignResolver<Maybe<string>, TypeParent, TContext>

    mode?: ModeResolver<Maybe<string>, TypeParent, TContext>

    recordedAt?: RecordedAtResolver<DateTime, TypeParent, TContext>

    recordedAtUnix?: RecordedAtUnixResolver<number, TypeParent, TContext>

    recordedTime?: RecordedTimeResolver<Time, TypeParent, TContext>

    timeDifference?: TimeDifferenceResolver<number, TypeParent, TContext>

    nextStopId?: NextStopIdResolver<string, TypeParent, TContext>

    alerts?: AlertsResolver<Alert[], TypeParent, TContext>

    cancellations?: CancellationsResolver<Cancellation[], TypeParent, TContext>

    isCancelled?: IsCancelledResolver<boolean, TypeParent, TContext>
  }

  export type IdResolver<R = string, Parent = VehicleJourney, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type LineIdResolver<
    R = Maybe<string>,
    Parent = VehicleJourney,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type RouteIdResolver<R = string, Parent = VehicleJourney, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type DirectionResolver<
    R = Direction,
    Parent = VehicleJourney,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type OriginStopIdResolver<
    R = Maybe<string>,
    Parent = VehicleJourney,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type DepartureDateResolver<
    R = Date,
    Parent = VehicleJourney,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type DepartureTimeResolver<
    R = Time,
    Parent = VehicleJourney,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type UniqueVehicleIdResolver<
    R = Maybe<VehicleId>,
    Parent = VehicleJourney,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type OperatorIdResolver<
    R = Maybe<string>,
    Parent = VehicleJourney,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type VehicleIdResolver<
    R = Maybe<string>,
    Parent = VehicleJourney,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type HeadsignResolver<
    R = Maybe<string>,
    Parent = VehicleJourney,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type ModeResolver<
    R = Maybe<string>,
    Parent = VehicleJourney,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type RecordedAtResolver<
    R = DateTime,
    Parent = VehicleJourney,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type RecordedAtUnixResolver<
    R = number,
    Parent = VehicleJourney,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type RecordedTimeResolver<
    R = Time,
    Parent = VehicleJourney,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type TimeDifferenceResolver<
    R = number,
    Parent = VehicleJourney,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type NextStopIdResolver<
    R = string,
    Parent = VehicleJourney,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type AlertsResolver<R = Alert[], Parent = VehicleJourney, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type CancellationsResolver<
    R = Cancellation[],
    Parent = VehicleJourney,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type IsCancelledResolver<
    R = boolean,
    Parent = VehicleJourney,
    TContext = {}
  > = Resolver<R, Parent, TContext>
}

export namespace AreaJourneyResolvers {
  export interface Resolvers<TContext = {}, TypeParent = AreaJourney> {
    id?: IdResolver<string, TypeParent, TContext>

    lineId?: LineIdResolver<Maybe<string>, TypeParent, TContext>

    routeId?: RouteIdResolver<string, TypeParent, TContext>

    direction?: DirectionResolver<Direction, TypeParent, TContext>

    departureDate?: DepartureDateResolver<Date, TypeParent, TContext>

    departureTime?: DepartureTimeResolver<Time, TypeParent, TContext>

    uniqueVehicleId?: UniqueVehicleIdResolver<Maybe<VehicleId>, TypeParent, TContext>

    operatorId?: OperatorIdResolver<Maybe<string>, TypeParent, TContext>

    vehicleId?: VehicleIdResolver<Maybe<string>, TypeParent, TContext>

    headsign?: HeadsignResolver<Maybe<string>, TypeParent, TContext>

    mode?: ModeResolver<Maybe<string>, TypeParent, TContext>

    vehiclePositions?: VehiclePositionsResolver<
      Array<Maybe<VehiclePosition>>,
      TypeParent,
      TContext
    >

    alerts?: AlertsResolver<Alert[], TypeParent, TContext>

    cancellations?: CancellationsResolver<Cancellation[], TypeParent, TContext>

    isCancelled?: IsCancelledResolver<boolean, TypeParent, TContext>
  }

  export type IdResolver<R = string, Parent = AreaJourney, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type LineIdResolver<
    R = Maybe<string>,
    Parent = AreaJourney,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type RouteIdResolver<R = string, Parent = AreaJourney, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type DirectionResolver<R = Direction, Parent = AreaJourney, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type DepartureDateResolver<R = Date, Parent = AreaJourney, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type DepartureTimeResolver<R = Time, Parent = AreaJourney, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type UniqueVehicleIdResolver<
    R = Maybe<VehicleId>,
    Parent = AreaJourney,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type OperatorIdResolver<
    R = Maybe<string>,
    Parent = AreaJourney,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type VehicleIdResolver<
    R = Maybe<string>,
    Parent = AreaJourney,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type HeadsignResolver<
    R = Maybe<string>,
    Parent = AreaJourney,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type ModeResolver<R = Maybe<string>, Parent = AreaJourney, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type VehiclePositionsResolver<
    R = Array<Maybe<VehiclePosition>>,
    Parent = AreaJourney,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type AlertsResolver<R = Alert[], Parent = AreaJourney, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type CancellationsResolver<
    R = Cancellation[],
    Parent = AreaJourney,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type IsCancelledResolver<R = boolean, Parent = AreaJourney, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
}

export namespace UiMessageResolvers {
  export interface Resolvers<TContext = {}, TypeParent = UiMessage> {
    date?: DateResolver<Maybe<string>, TypeParent, TContext>

    message?: MessageResolver<Maybe<string>, TypeParent, TContext>
  }

  export type DateResolver<R = Maybe<string>, Parent = UiMessage, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type MessageResolver<R = Maybe<string>, Parent = UiMessage, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
}

/** Any object that describes something with a position implements this interface. */
export namespace PositionResolvers {
  export interface Resolvers {
    __resolveType: ResolveType
  }
  export type ResolveType<
    R = 'Stop' | 'RouteGeometryPoint' | 'RouteSegment' | 'VehiclePosition',
    Parent = Stop | RouteGeometryPoint | RouteSegment | VehiclePosition,
    TContext = {}
  > = TypeResolveFn<R, Parent, TContext>
}

export namespace JourneyEventTypeResolvers {
  export interface Resolvers {
    __resolveType: ResolveType
  }
  export type ResolveType<
    R = 'JourneyEvent' | 'JourneyStopEvent' | 'JourneyCancellationEvent' | 'PlannedStopEvent',
    Parent = JourneyEvent | JourneyStopEvent | JourneyCancellationEvent | PlannedStopEvent,
    TContext = {}
  > = TypeResolveFn<R, Parent, TContext>
}

export type CacheControlDirectiveResolver<Result> = DirectiveResolverFn<
  Result,
  CacheControlDirectiveArgs,
  {}
>
export interface CacheControlDirectiveArgs {
  maxAge?: Maybe<number>

  scope?: Maybe<CacheControlScope>
}

/** Directs the executor to skip this field or fragment when the `if` argument is true. */
export type SkipDirectiveResolver<Result> = DirectiveResolverFn<Result, SkipDirectiveArgs, {}>
export interface SkipDirectiveArgs {
  /** Skipped when true. */
  if: boolean
}

/** Directs the executor to include this field or fragment only when the `if` argument is true. */
export type IncludeDirectiveResolver<Result> = DirectiveResolverFn<
  Result,
  IncludeDirectiveArgs,
  {}
>
export interface IncludeDirectiveArgs {
  /** Included when true. */
  if: boolean
}

/** Marks an element of a GraphQL schema as no longer supported. */
export type DeprecatedDirectiveResolver<Result> = DirectiveResolverFn<
  Result,
  DeprecatedDirectiveArgs,
  {}
>
export interface DeprecatedDirectiveArgs {
  /** Explains why this element was deprecated, usually also including a suggestion for how to access supported similar data. Formatted using the Markdown syntax (as specified by [CommonMark](https://commonmark.org/). */
  reason?: string
}

export interface DateScalarConfig extends GraphQLScalarTypeConfig<Date, any> {
  name: 'Date'
}
export interface DirectionScalarConfig extends GraphQLScalarTypeConfig<Direction, any> {
  name: 'Direction'
}
export interface DateTimeScalarConfig extends GraphQLScalarTypeConfig<DateTime, any> {
  name: 'DateTime'
}
export interface PreciseBBoxScalarConfig extends GraphQLScalarTypeConfig<PreciseBBox, any> {
  name: 'PreciseBBox'
}
export interface TimeScalarConfig extends GraphQLScalarTypeConfig<Time, any> {
  name: 'Time'
}
export interface VehicleIdScalarConfig extends GraphQLScalarTypeConfig<VehicleId, any> {
  name: 'VehicleId'
}
export interface BBoxScalarConfig extends GraphQLScalarTypeConfig<BBox, any> {
  name: 'BBox'
}
export interface UploadScalarConfig extends GraphQLScalarTypeConfig<Upload, any> {
  name: 'Upload'
}

export type IResolvers<TContext = {}> = {
  Query?: QueryResolvers.Resolvers<TContext>
  Equipment?: EquipmentResolvers.Resolvers<TContext>
  Stop?: StopResolvers.Resolvers<TContext>
  StopRoute?: StopRouteResolvers.Resolvers<TContext>
  Alert?: AlertResolvers.Resolvers<TContext>
  Route?: RouteResolvers.Resolvers<TContext>
  Cancellation?: CancellationResolvers.Resolvers<TContext>
  RouteGeometry?: RouteGeometryResolvers.Resolvers<TContext>
  RouteGeometryPoint?: RouteGeometryPointResolvers.Resolvers<TContext>
  RouteSegment?: RouteSegmentResolvers.Resolvers<TContext>
  Line?: LineResolvers.Resolvers<TContext>
  Departure?: DepartureResolvers.Resolvers<TContext>
  DepartureJourney?: DepartureJourneyResolvers.Resolvers<TContext>
  VehiclePosition?: VehiclePositionResolvers.Resolvers<TContext>
  JourneyStopEvent?: JourneyStopEventResolvers.Resolvers<TContext>
  PlannedDeparture?: PlannedDepartureResolvers.Resolvers<TContext>
  PlannedArrival?: PlannedArrivalResolvers.Resolvers<TContext>
  ObservedArrival?: ObservedArrivalResolvers.Resolvers<TContext>
  ObservedDeparture?: ObservedDepartureResolvers.Resolvers<TContext>
  ExceptionDay?: ExceptionDayResolvers.Resolvers<TContext>
  Journey?: JourneyResolvers.Resolvers<TContext>
  JourneyEvent?: JourneyEventResolvers.Resolvers<TContext>
  JourneyCancellationEvent?: JourneyCancellationEventResolvers.Resolvers<TContext>
  PlannedStopEvent?: PlannedStopEventResolvers.Resolvers<TContext>
  VehicleJourney?: VehicleJourneyResolvers.Resolvers<TContext>
  AreaJourney?: AreaJourneyResolvers.Resolvers<TContext>
  UiMessage?: UiMessageResolvers.Resolvers<TContext>
  Position?: PositionResolvers.Resolvers
  JourneyEventType?: JourneyEventTypeResolvers.Resolvers
  Date?: GraphQLScalarType
  Direction?: GraphQLScalarType
  DateTime?: GraphQLScalarType
  PreciseBBox?: GraphQLScalarType
  Time?: GraphQLScalarType
  VehicleId?: GraphQLScalarType
  BBox?: GraphQLScalarType
  Upload?: GraphQLScalarType
} & { [typeName: string]: never }

export type IDirectiveResolvers<Result> = {
  cacheControl?: CacheControlDirectiveResolver<Result>
  skip?: SkipDirectiveResolver<Result>
  include?: IncludeDirectiveResolver<Result>
  deprecated?: DeprecatedDirectiveResolver<Result>
} & { [directiveName: string]: never }
