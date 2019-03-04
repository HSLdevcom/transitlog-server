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

    stops?: StopsResolver<Array<Maybe<Stop>>, TypeParent, TContext>

    routes?: RoutesResolver<Array<Maybe<Route>>, TypeParent, TContext>

    routeGeometry?: RouteGeometryResolver<Maybe<RouteGeometry>, TypeParent, TContext>

    lines?: LinesResolver<Array<Maybe<Line>>, TypeParent, TContext>

    departures?: DeparturesResolver<Array<Maybe<Departure>>, TypeParent, TContext>

    journey?: JourneyResolver<Maybe<Journey>, TypeParent, TContext>
  }

  export type EquipmentResolver<R = Array<Maybe<Equipment>>, Parent = {}, TContext = {}> = Resolver<
    R,
    Parent,
    TContext,
    EquipmentArgs
  >
  export interface EquipmentArgs {
    filter?: Maybe<EquipmentFilterInput>

    date?: Maybe<Date>
  }

  export type StopsResolver<R = Array<Maybe<Stop>>, Parent = {}, TContext = {}> = Resolver<
    R,
    Parent,
    TContext,
    StopsArgs
  >
  export interface StopsArgs {
    filter?: Maybe<StopFilterInput>
  }

  export type RoutesResolver<R = Array<Maybe<Route>>, Parent = {}, TContext = {}> = Resolver<
    R,
    Parent,
    TContext,
    RoutesArgs
  >
  export interface RoutesArgs {
    filter?: Maybe<RouteFilterInput>

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

  export type LinesResolver<R = Array<Maybe<Line>>, Parent = {}, TContext = {}> = Resolver<
    R,
    Parent,
    TContext,
    LinesArgs
  >
  export interface LinesArgs {
    filter?: Maybe<LineFilterInput>

    date?: Maybe<Date>

    includeLinesWithoutRoutes?: Maybe<boolean>
  }

  export type DeparturesResolver<
    R = Array<Maybe<Departure>>,
    Parent = {},
    TContext = {}
  > = Resolver<R, Parent, TContext, DeparturesArgs>
  export interface DeparturesArgs {
    filter?: Maybe<DepartureFilterInput>

    stopId?: Maybe<string>

    date: Date
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

    instance?: Maybe<number>
  }
}

export namespace EquipmentResolvers {
  export interface Resolvers<TContext = {}, TypeParent = Equipment> {
    id?: IdResolver<string, TypeParent, TContext>

    vehicleId?: VehicleIdResolver<string, TypeParent, TContext>

    operatorId?: OperatorIdResolver<string, TypeParent, TContext>

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
  export type InServiceResolver<R = Maybe<boolean>, Parent = Equipment, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type _MatchScoreResolver<R = Maybe<number>, Parent = Equipment, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
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

    modes?: ModesResolver<Array<Maybe<string>>, TypeParent, TContext>

    _matchScore?: _MatchScoreResolver<Maybe<number>, TypeParent, TContext>
  }

  export type IdResolver<R = string, Parent = Stop, TContext = {}> = Resolver<R, Parent, TContext>
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
  export type LatResolver<R = number, Parent = Stop, TContext = {}> = Resolver<R, Parent, TContext>
  export type LngResolver<R = number, Parent = Stop, TContext = {}> = Resolver<R, Parent, TContext>
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
  export type ModesResolver<R = Array<Maybe<string>>, Parent = Stop, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type _MatchScoreResolver<R = Maybe<number>, Parent = Stop, TContext = {}> = Resolver<
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

    originStopId?: OriginStopIdResolver<Maybe<string>, TypeParent, TContext>

    _matchScore?: _MatchScoreResolver<Maybe<number>, TypeParent, TContext>
  }

  export type IdResolver<R = string, Parent = Route, TContext = {}> = Resolver<R, Parent, TContext>
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
  export type OriginStopIdResolver<R = Maybe<string>, Parent = Route, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type _MatchScoreResolver<R = Maybe<number>, Parent = Route, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
}

export namespace RouteGeometryResolvers {
  export interface Resolvers<TContext = {}, TypeParent = RouteGeometry> {
    coordinates?: CoordinatesResolver<RouteGeometryPoint[], TypeParent, TContext>
  }

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

export namespace LineResolvers {
  export interface Resolvers<TContext = {}, TypeParent = Line> {
    id?: IdResolver<string, TypeParent, TContext>

    lineId?: LineIdResolver<string, TypeParent, TContext>

    name?: NameResolver<Maybe<string>, TypeParent, TContext>

    _matchScore?: _MatchScoreResolver<Maybe<number>, TypeParent, TContext>
  }

  export type IdResolver<R = string, Parent = Line, TContext = {}> = Resolver<R, Parent, TContext>
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

    departureId?: DepartureIdResolver<Maybe<number>, TypeParent, TContext>

    extraDeparture?: ExtraDepartureResolver<Maybe<string>, TypeParent, TContext>

    isNextDay?: IsNextDayResolver<Maybe<boolean>, TypeParent, TContext>

    isTimingStop?: IsTimingStopResolver<Maybe<boolean>, TypeParent, TContext>

    index?: IndexResolver<Maybe<number>, TypeParent, TContext>

    stop?: StopResolver<DepartureStop, TypeParent, TContext>

    plannedArrivalTime?: PlannedArrivalTimeResolver<Maybe<PlannedArrival>, TypeParent, TContext>

    observedArrivalTime?: ObservedArrivalTimeResolver<Maybe<ObservedArrival>, TypeParent, TContext>

    plannedDepartureTime?: PlannedDepartureTimeResolver<
      Maybe<PlannedDeparture>,
      TypeParent,
      TContext
    >

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
  export type OperatorIdResolver<R = Maybe<string>, Parent = Departure, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
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
  export type TerminalTimeResolver<R = Maybe<number>, Parent = Departure, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type RecoveryTimeResolver<R = Maybe<number>, Parent = Departure, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type DepartureIdResolver<R = Maybe<number>, Parent = Departure, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type ExtraDepartureResolver<
    R = Maybe<string>,
    Parent = Departure,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type IsNextDayResolver<R = Maybe<boolean>, Parent = Departure, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type IsTimingStopResolver<
    R = Maybe<boolean>,
    Parent = Departure,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type IndexResolver<R = Maybe<number>, Parent = Departure, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type StopResolver<R = DepartureStop, Parent = Departure, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type PlannedArrivalTimeResolver<
    R = Maybe<PlannedArrival>,
    Parent = Departure,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type ObservedArrivalTimeResolver<
    R = Maybe<ObservedArrival>,
    Parent = Departure,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type PlannedDepartureTimeResolver<
    R = Maybe<PlannedDeparture>,
    Parent = Departure,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type ObservedDepartureTimeResolver<
    R = Maybe<ObservedDeparture>,
    Parent = Departure,
    TContext = {}
  > = Resolver<R, Parent, TContext>
}

export namespace DepartureStopResolvers {
  export interface Resolvers<TContext = {}, TypeParent = DepartureStop> {
    id?: IdResolver<string, TypeParent, TContext>

    destination?: DestinationResolver<Maybe<string>, TypeParent, TContext>

    distanceFromPrevious?: DistanceFromPreviousResolver<Maybe<number>, TypeParent, TContext>

    distanceFromStart?: DistanceFromStartResolver<Maybe<number>, TypeParent, TContext>

    duration?: DurationResolver<Maybe<number>, TypeParent, TContext>

    stopIndex?: StopIndexResolver<Maybe<number>, TypeParent, TContext>

    isTimingStop?: IsTimingStopResolver<Maybe<boolean>, TypeParent, TContext>

    stopId?: StopIdResolver<string, TypeParent, TContext>

    shortId?: ShortIdResolver<string, TypeParent, TContext>

    lat?: LatResolver<number, TypeParent, TContext>

    lng?: LngResolver<number, TypeParent, TContext>

    name?: NameResolver<Maybe<string>, TypeParent, TContext>

    radius?: RadiusResolver<Maybe<number>, TypeParent, TContext>

    modes?: ModesResolver<Array<Maybe<string>>, TypeParent, TContext>
  }

  export type IdResolver<R = string, Parent = DepartureStop, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type DestinationResolver<
    R = Maybe<string>,
    Parent = DepartureStop,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type DistanceFromPreviousResolver<
    R = Maybe<number>,
    Parent = DepartureStop,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type DistanceFromStartResolver<
    R = Maybe<number>,
    Parent = DepartureStop,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type DurationResolver<R = Maybe<number>, Parent = DepartureStop, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type StopIndexResolver<
    R = Maybe<number>,
    Parent = DepartureStop,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type IsTimingStopResolver<
    R = Maybe<boolean>,
    Parent = DepartureStop,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type StopIdResolver<R = string, Parent = DepartureStop, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type ShortIdResolver<R = string, Parent = DepartureStop, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type LatResolver<R = number, Parent = DepartureStop, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type LngResolver<R = number, Parent = DepartureStop, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type NameResolver<R = Maybe<string>, Parent = DepartureStop, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type RadiusResolver<R = Maybe<number>, Parent = DepartureStop, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type ModesResolver<
    R = Array<Maybe<string>>,
    Parent = DepartureStop,
    TContext = {}
  > = Resolver<R, Parent, TContext>
}

export namespace PlannedArrivalResolvers {
  export interface Resolvers<TContext = {}, TypeParent = PlannedArrival> {
    arrivalDate?: ArrivalDateResolver<Date, TypeParent, TContext>

    arrivalTime?: ArrivalTimeResolver<Time, TypeParent, TContext>

    arrivalDateTime?: ArrivalDateTimeResolver<DateTime, TypeParent, TContext>
  }

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
}

export namespace ObservedArrivalResolvers {
  export interface Resolvers<TContext = {}, TypeParent = ObservedArrival> {
    arrivalEvent?: ArrivalEventResolver<JourneyEvent, TypeParent, TContext>

    arrivalDate?: ArrivalDateResolver<Date, TypeParent, TContext>

    arrivalTime?: ArrivalTimeResolver<Time, TypeParent, TContext>

    arrivalDateTime?: ArrivalDateTimeResolver<DateTime, TypeParent, TContext>

    arrivalTimeDifference?: ArrivalTimeDifferenceResolver<number, TypeParent, TContext>

    doorDidOpen?: DoorDidOpenResolver<boolean, TypeParent, TContext>
  }

  export type ArrivalEventResolver<
    R = JourneyEvent,
    Parent = ObservedArrival,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type ArrivalDateResolver<R = Date, Parent = ObservedArrival, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type ArrivalTimeResolver<R = Time, Parent = ObservedArrival, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
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
  export type DoorDidOpenResolver<R = boolean, Parent = ObservedArrival, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
}

export namespace JourneyEventResolvers {
  export interface Resolvers<TContext = {}, TypeParent = JourneyEvent> {
    receivedAt?: ReceivedAtResolver<DateTime, TypeParent, TContext>

    recordedAt?: RecordedAtResolver<DateTime, TypeParent, TContext>

    recordedAtUnix?: RecordedAtUnixResolver<number, TypeParent, TContext>

    recordedTime?: RecordedTimeResolver<Time, TypeParent, TContext>

    nextStopId?: NextStopIdResolver<Maybe<string>, TypeParent, TContext>

    lat?: LatResolver<number, TypeParent, TContext>

    lng?: LngResolver<number, TypeParent, TContext>

    doorStatus?: DoorStatusResolver<Maybe<boolean>, TypeParent, TContext>

    velocity?: VelocityResolver<Maybe<number>, TypeParent, TContext>

    delay?: DelayResolver<Maybe<number>, TypeParent, TContext>

    heading?: HeadingResolver<Maybe<number>, TypeParent, TContext>
  }

  export type ReceivedAtResolver<R = DateTime, Parent = JourneyEvent, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type RecordedAtResolver<R = DateTime, Parent = JourneyEvent, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type RecordedAtUnixResolver<R = number, Parent = JourneyEvent, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type RecordedTimeResolver<R = Time, Parent = JourneyEvent, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type NextStopIdResolver<
    R = Maybe<string>,
    Parent = JourneyEvent,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type LatResolver<R = number, Parent = JourneyEvent, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type LngResolver<R = number, Parent = JourneyEvent, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type DoorStatusResolver<
    R = Maybe<boolean>,
    Parent = JourneyEvent,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type VelocityResolver<R = Maybe<number>, Parent = JourneyEvent, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type DelayResolver<R = Maybe<number>, Parent = JourneyEvent, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type HeadingResolver<R = Maybe<number>, Parent = JourneyEvent, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
}

export namespace PlannedDepartureResolvers {
  export interface Resolvers<TContext = {}, TypeParent = PlannedDeparture> {
    departureDate?: DepartureDateResolver<Date, TypeParent, TContext>

    departureTime?: DepartureTimeResolver<Time, TypeParent, TContext>

    departureDateTime?: DepartureDateTimeResolver<DateTime, TypeParent, TContext>
  }

  export type DepartureDateResolver<R = Date, Parent = PlannedDeparture, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type DepartureTimeResolver<R = Time, Parent = PlannedDeparture, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type DepartureDateTimeResolver<
    R = DateTime,
    Parent = PlannedDeparture,
    TContext = {}
  > = Resolver<R, Parent, TContext>
}

export namespace ObservedDepartureResolvers {
  export interface Resolvers<TContext = {}, TypeParent = ObservedDeparture> {
    departureEvent?: DepartureEventResolver<JourneyEvent, TypeParent, TContext>

    departureDate?: DepartureDateResolver<Date, TypeParent, TContext>

    departureTime?: DepartureTimeResolver<Time, TypeParent, TContext>

    departureDateTime?: DepartureDateTimeResolver<DateTime, TypeParent, TContext>

    departureTimeDifference?: DepartureTimeDifferenceResolver<number, TypeParent, TContext>
  }

  export type DepartureEventResolver<
    R = JourneyEvent,
    Parent = ObservedDeparture,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type DepartureDateResolver<R = Date, Parent = ObservedDeparture, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type DepartureTimeResolver<R = Time, Parent = ObservedDeparture, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
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

export namespace JourneyResolvers {
  export interface Resolvers<TContext = {}, TypeParent = Journey> {
    id?: IdResolver<string, TypeParent, TContext>

    lineId?: LineIdResolver<string, TypeParent, TContext>

    routeId?: RouteIdResolver<string, TypeParent, TContext>

    direction?: DirectionResolver<Direction, TypeParent, TContext>

    departureDate?: DepartureDateResolver<Date, TypeParent, TContext>

    departureTime?: DepartureTimeResolver<Time, TypeParent, TContext>

    uniqueVehicleId?: UniqueVehicleIdResolver<Maybe<VehicleId>, TypeParent, TContext>

    operatorId?: OperatorIdResolver<Maybe<string>, TypeParent, TContext>

    vehicleId?: VehicleIdResolver<Maybe<string>, TypeParent, TContext>

    instance?: InstanceResolver<Maybe<number>, TypeParent, TContext>

    headsign?: HeadsignResolver<Maybe<string>, TypeParent, TContext>

    name?: NameResolver<Maybe<string>, TypeParent, TContext>

    equipment?: EquipmentResolver<Equipment, TypeParent, TContext>

    events?: EventsResolver<Array<Maybe<JourneyEvent>>, TypeParent, TContext>

    departures?: DeparturesResolver<Array<Maybe<Departure>>, TypeParent, TContext>
  }

  export type IdResolver<R = string, Parent = Journey, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type LineIdResolver<R = string, Parent = Journey, TContext = {}> = Resolver<
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
  export type OperatorIdResolver<R = Maybe<string>, Parent = Journey, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type VehicleIdResolver<R = Maybe<string>, Parent = Journey, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type InstanceResolver<R = Maybe<number>, Parent = Journey, TContext = {}> = Resolver<
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
  export type EquipmentResolver<R = Equipment, Parent = Journey, TContext = {}> = Resolver<
    R,
    Parent,
    TContext
  >
  export type EventsResolver<
    R = Array<Maybe<JourneyEvent>>,
    Parent = Journey,
    TContext = {}
  > = Resolver<R, Parent, TContext>
  export type DeparturesResolver<
    R = Array<Maybe<Departure>>,
    Parent = Journey,
    TContext = {}
  > = Resolver<R, Parent, TContext>
}

/** Any object that describes something with a position implements this interface. */
export namespace PositionResolvers {
  export interface Resolvers {
    __resolveType: ResolveType
  }
  export type ResolveType<
    R = 'Stop' | 'RouteGeometryPoint' | 'JourneyEvent',
    Parent = Stop | RouteGeometryPoint | JourneyEvent,
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
export type IncludeDirectiveResolver<Result> = DirectiveResolverFn<Result, IncludeDirectiveArgs, {}>
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
export interface BBoxScalarConfig extends GraphQLScalarTypeConfig<BBox, any> {
  name: 'BBox'
}
export interface DirectionScalarConfig extends GraphQLScalarTypeConfig<Direction, any> {
  name: 'Direction'
}
export interface TimeScalarConfig extends GraphQLScalarTypeConfig<Time, any> {
  name: 'Time'
}
export interface DateTimeScalarConfig extends GraphQLScalarTypeConfig<DateTime, any> {
  name: 'DateTime'
}
export interface VehicleIdScalarConfig extends GraphQLScalarTypeConfig<VehicleId, any> {
  name: 'VehicleId'
}
export interface UploadScalarConfig extends GraphQLScalarTypeConfig<Upload, any> {
  name: 'Upload'
}

export interface IResolvers<TContext = {}> {
  Query?: QueryResolvers.Resolvers<TContext>
  Equipment?: EquipmentResolvers.Resolvers<TContext>
  Stop?: StopResolvers.Resolvers<TContext>
  Route?: RouteResolvers.Resolvers<TContext>
  RouteGeometry?: RouteGeometryResolvers.Resolvers<TContext>
  RouteGeometryPoint?: RouteGeometryPointResolvers.Resolvers<TContext>
  Line?: LineResolvers.Resolvers<TContext>
  Departure?: DepartureResolvers.Resolvers<TContext>
  DepartureStop?: DepartureStopResolvers.Resolvers<TContext>
  PlannedArrival?: PlannedArrivalResolvers.Resolvers<TContext>
  ObservedArrival?: ObservedArrivalResolvers.Resolvers<TContext>
  JourneyEvent?: JourneyEventResolvers.Resolvers<TContext>
  PlannedDeparture?: PlannedDepartureResolvers.Resolvers<TContext>
  ObservedDeparture?: ObservedDepartureResolvers.Resolvers<TContext>
  Journey?: JourneyResolvers.Resolvers<TContext>
  Position?: PositionResolvers.Resolvers
  Date?: GraphQLScalarType
  BBox?: GraphQLScalarType
  Direction?: GraphQLScalarType
  Time?: GraphQLScalarType
  DateTime?: GraphQLScalarType
  VehicleId?: GraphQLScalarType
  Upload?: GraphQLScalarType
}

export interface IDirectiveResolvers<Result> {
  cacheControl?: CacheControlDirectiveResolver<Result>
  skip?: SkipDirectiveResolver<Result>
  include?: IncludeDirectiveResolver<Result>
  deprecated?: DeprecatedDirectiveResolver<Result>
}
