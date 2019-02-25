export type Maybe<T> = T | null

/** ordering options when selecting data from "vehicles" */
export interface VehiclesOrderBy {
  acc?: Maybe<OrderBy>

  desi?: Maybe<OrderBy>

  dir?: Maybe<OrderBy>

  direction_id?: Maybe<OrderBy>

  dl?: Maybe<OrderBy>

  drst?: Maybe<OrderBy>

  geohash_level?: Maybe<OrderBy>

  hdg?: Maybe<OrderBy>

  headsign?: Maybe<OrderBy>

  is_ongoing?: Maybe<OrderBy>

  journey_start_time?: Maybe<OrderBy>

  journey_type?: Maybe<OrderBy>

  jrn?: Maybe<OrderBy>

  lat?: Maybe<OrderBy>

  line?: Maybe<OrderBy>

  long?: Maybe<OrderBy>

  mode?: Maybe<OrderBy>

  next_stop_id?: Maybe<OrderBy>

  oday?: Maybe<OrderBy>

  odo?: Maybe<OrderBy>

  oper?: Maybe<OrderBy>

  owner_operator_id?: Maybe<OrderBy>

  received_at?: Maybe<OrderBy>

  route_id?: Maybe<OrderBy>

  spd?: Maybe<OrderBy>

  start?: Maybe<OrderBy>

  topic_latitude?: Maybe<OrderBy>

  topic_longitude?: Maybe<OrderBy>

  topic_prefix?: Maybe<OrderBy>

  topic_version?: Maybe<OrderBy>

  tsi?: Maybe<OrderBy>

  tst?: Maybe<OrderBy>

  unique_vehicle_id?: Maybe<OrderBy>

  veh?: Maybe<OrderBy>

  vehicle_number?: Maybe<OrderBy>
}
/** Boolean expression to filter rows from the table "vehicles". All fields are combined with a logical 'AND'. */
export interface VehiclesBoolExp {
  _and?: Maybe<Array<Maybe<VehiclesBoolExp>>>

  _not?: Maybe<VehiclesBoolExp>

  _or?: Maybe<Array<Maybe<VehiclesBoolExp>>>

  acc?: Maybe<Float8ComparisonExp>

  desi?: Maybe<TextComparisonExp>

  dir?: Maybe<SmallintComparisonExp>

  direction_id?: Maybe<SmallintComparisonExp>

  dl?: Maybe<IntegerComparisonExp>

  drst?: Maybe<BooleanComparisonExp>

  geohash_level?: Maybe<SmallintComparisonExp>

  hdg?: Maybe<Float8ComparisonExp>

  headsign?: Maybe<TextComparisonExp>

  is_ongoing?: Maybe<BooleanComparisonExp>

  journey_start_time?: Maybe<TimeComparisonExp>

  journey_type?: Maybe<JourneyTypeComparisonExp>

  jrn?: Maybe<SmallintComparisonExp>

  lat?: Maybe<Float8ComparisonExp>

  line?: Maybe<SmallintComparisonExp>

  long?: Maybe<Float8ComparisonExp>

  mode?: Maybe<TransportModeComparisonExp>

  next_stop_id?: Maybe<TextComparisonExp>

  oday?: Maybe<DateComparisonExp>

  odo?: Maybe<Float8ComparisonExp>

  oper?: Maybe<SmallintComparisonExp>

  owner_operator_id?: Maybe<SmallintComparisonExp>

  received_at?: Maybe<TimestamptzComparisonExp>

  route_id?: Maybe<TextComparisonExp>

  spd?: Maybe<Float8ComparisonExp>

  start?: Maybe<TimeComparisonExp>

  topic_latitude?: Maybe<Float8ComparisonExp>

  topic_longitude?: Maybe<Float8ComparisonExp>

  topic_prefix?: Maybe<TextComparisonExp>

  topic_version?: Maybe<TextComparisonExp>

  tsi?: Maybe<BigintComparisonExp>

  tst?: Maybe<TimestamptzComparisonExp>

  unique_vehicle_id?: Maybe<TextComparisonExp>

  veh?: Maybe<IntegerComparisonExp>

  vehicle_number?: Maybe<IntegerComparisonExp>
}
/** expression to compare columns of type float8. All fields are combined with logical 'AND'. */
export interface Float8ComparisonExp {
  _eq?: Maybe<Float8>

  _gt?: Maybe<Float8>

  _gte?: Maybe<Float8>

  _in?: Maybe<Array<Maybe<Float8>>>

  _is_null?: Maybe<boolean>

  _lt?: Maybe<Float8>

  _lte?: Maybe<Float8>

  _neq?: Maybe<Float8>

  _nin?: Maybe<Array<Maybe<Float8>>>
}
/** expression to compare columns of type text. All fields are combined with logical 'AND'. */
export interface TextComparisonExp {
  _eq?: Maybe<string>

  _gt?: Maybe<string>

  _gte?: Maybe<string>

  _ilike?: Maybe<string>

  _in?: Maybe<Array<Maybe<string>>>

  _is_null?: Maybe<boolean>

  _like?: Maybe<string>

  _lt?: Maybe<string>

  _lte?: Maybe<string>

  _neq?: Maybe<string>

  _nilike?: Maybe<string>

  _nin?: Maybe<Array<Maybe<string>>>

  _nlike?: Maybe<string>

  _nsimilar?: Maybe<string>

  _similar?: Maybe<string>
}
/** expression to compare columns of type smallint. All fields are combined with logical 'AND'. */
export interface SmallintComparisonExp {
  _eq?: Maybe<Smallint>

  _gt?: Maybe<Smallint>

  _gte?: Maybe<Smallint>

  _in?: Maybe<Array<Maybe<Smallint>>>

  _is_null?: Maybe<boolean>

  _lt?: Maybe<Smallint>

  _lte?: Maybe<Smallint>

  _neq?: Maybe<Smallint>

  _nin?: Maybe<Array<Maybe<Smallint>>>
}
/** expression to compare columns of type integer. All fields are combined with logical 'AND'. */
export interface IntegerComparisonExp {
  _eq?: Maybe<number>

  _gt?: Maybe<number>

  _gte?: Maybe<number>

  _in?: Maybe<Array<Maybe<number>>>

  _is_null?: Maybe<boolean>

  _lt?: Maybe<number>

  _lte?: Maybe<number>

  _neq?: Maybe<number>

  _nin?: Maybe<Array<Maybe<number>>>
}
/** expression to compare columns of type boolean. All fields are combined with logical 'AND'. */
export interface BooleanComparisonExp {
  _eq?: Maybe<boolean>

  _gt?: Maybe<boolean>

  _gte?: Maybe<boolean>

  _in?: Maybe<Array<Maybe<boolean>>>

  _is_null?: Maybe<boolean>

  _lt?: Maybe<boolean>

  _lte?: Maybe<boolean>

  _neq?: Maybe<boolean>

  _nin?: Maybe<Array<Maybe<boolean>>>
}
/** expression to compare columns of type time. All fields are combined with logical 'AND'. */
export interface TimeComparisonExp {
  _eq?: Maybe<Time>

  _gt?: Maybe<Time>

  _gte?: Maybe<Time>

  _in?: Maybe<Array<Maybe<Time>>>

  _is_null?: Maybe<boolean>

  _lt?: Maybe<Time>

  _lte?: Maybe<Time>

  _neq?: Maybe<Time>

  _nin?: Maybe<Array<Maybe<Time>>>
}
/** expression to compare columns of type journey_type. All fields are combined with logical 'AND'. */
export interface JourneyTypeComparisonExp {
  _eq?: Maybe<JourneyType>

  _gt?: Maybe<JourneyType>

  _gte?: Maybe<JourneyType>

  _in?: Maybe<Array<Maybe<JourneyType>>>

  _is_null?: Maybe<boolean>

  _lt?: Maybe<JourneyType>

  _lte?: Maybe<JourneyType>

  _neq?: Maybe<JourneyType>

  _nin?: Maybe<Array<Maybe<JourneyType>>>
}
/** expression to compare columns of type transport_mode. All fields are combined with logical 'AND'. */
export interface TransportModeComparisonExp {
  _eq?: Maybe<TransportMode>

  _gt?: Maybe<TransportMode>

  _gte?: Maybe<TransportMode>

  _in?: Maybe<Array<Maybe<TransportMode>>>

  _is_null?: Maybe<boolean>

  _lt?: Maybe<TransportMode>

  _lte?: Maybe<TransportMode>

  _neq?: Maybe<TransportMode>

  _nin?: Maybe<Array<Maybe<TransportMode>>>
}
/** expression to compare columns of type date. All fields are combined with logical 'AND'. */
export interface DateComparisonExp {
  _eq?: Maybe<Date>

  _gt?: Maybe<Date>

  _gte?: Maybe<Date>

  _in?: Maybe<Array<Maybe<Date>>>

  _is_null?: Maybe<boolean>

  _lt?: Maybe<Date>

  _lte?: Maybe<Date>

  _neq?: Maybe<Date>

  _nin?: Maybe<Array<Maybe<Date>>>
}
/** expression to compare columns of type timestamptz. All fields are combined with logical 'AND'. */
export interface TimestamptzComparisonExp {
  _eq?: Maybe<Timestamptz>

  _gt?: Maybe<Timestamptz>

  _gte?: Maybe<Timestamptz>

  _in?: Maybe<Array<Maybe<Timestamptz>>>

  _is_null?: Maybe<boolean>

  _lt?: Maybe<Timestamptz>

  _lte?: Maybe<Timestamptz>

  _neq?: Maybe<Timestamptz>

  _nin?: Maybe<Array<Maybe<Timestamptz>>>
}
/** expression to compare columns of type bigint. All fields are combined with logical 'AND'. */
export interface BigintComparisonExp {
  _eq?: Maybe<Bigint>

  _gt?: Maybe<Bigint>

  _gte?: Maybe<Bigint>

  _in?: Maybe<Array<Maybe<Bigint>>>

  _is_null?: Maybe<boolean>

  _lt?: Maybe<Bigint>

  _lte?: Maybe<Bigint>

  _neq?: Maybe<Bigint>

  _nin?: Maybe<Array<Maybe<Bigint>>>
}
/** select columns of table "vehicles" */
export enum VehiclesSelectColumn {
  Acc = 'acc',
  Desi = 'desi',
  Dir = 'dir',
  DirectionId = 'direction_id',
  Dl = 'dl',
  Drst = 'drst',
  GeohashLevel = 'geohash_level',
  Hdg = 'hdg',
  Headsign = 'headsign',
  IsOngoing = 'is_ongoing',
  JourneyStartTime = 'journey_start_time',
  JourneyType = 'journey_type',
  Jrn = 'jrn',
  Lat = 'lat',
  Line = 'line',
  Long = 'long',
  Mode = 'mode',
  NextStopId = 'next_stop_id',
  Oday = 'oday',
  Odo = 'odo',
  Oper = 'oper',
  OwnerOperatorId = 'owner_operator_id',
  ReceivedAt = 'received_at',
  RouteId = 'route_id',
  Spd = 'spd',
  Start = 'start',
  TopicLatitude = 'topic_latitude',
  TopicLongitude = 'topic_longitude',
  TopicPrefix = 'topic_prefix',
  TopicVersion = 'topic_version',
  Tsi = 'tsi',
  Tst = 'tst',
  UniqueVehicleId = 'unique_vehicle_id',
  Veh = 'veh',
  VehicleNumber = 'vehicle_number',
}
/** column ordering options */
export enum OrderBy {
  Asc = 'asc',
  AscNullsFirst = 'asc_nulls_first',
  AscNullsLast = 'asc_nulls_last',
  Desc = 'desc',
  DescNullsFirst = 'desc_nulls_first',
  DescNullsLast = 'desc_nulls_last',
}

export type Float8 = any

export type Smallint = any

export type Time = any

export type JourneyType = any

export type TransportMode = any

export type Date = any

export type Timestamptz = any

export type Bigint = any

// ====================================================
// Scalars
// ====================================================

// ====================================================
// Types
// ====================================================

/** query root */
export interface QueryRoot {
  /** fetch data from the table: "vehicles" */
  vehicles: Vehicles[]
}

/** columns and relationships of "vehicles" */
export interface Vehicles {
  acc?: Maybe<Float8>

  desi?: Maybe<string>

  dir?: Maybe<Smallint>

  direction_id?: Maybe<Smallint>

  dl?: Maybe<number>

  drst?: Maybe<boolean>

  geohash_level?: Maybe<Smallint>

  hdg?: Maybe<Float8>

  headsign?: Maybe<string>

  is_ongoing: boolean

  journey_start_time?: Maybe<Time>

  journey_type: JourneyType

  jrn?: Maybe<Smallint>

  lat?: Maybe<Float8>

  line?: Maybe<Smallint>

  long?: Maybe<Float8>

  mode?: Maybe<TransportMode>

  next_stop_id?: Maybe<string>

  oday?: Maybe<Date>

  odo?: Maybe<Float8>

  oper?: Maybe<Smallint>

  owner_operator_id: Smallint

  received_at: Timestamptz

  route_id?: Maybe<string>

  spd?: Maybe<Float8>

  start?: Maybe<Time>

  topic_latitude?: Maybe<Float8>

  topic_longitude?: Maybe<Float8>

  topic_prefix: string

  topic_version: string

  tsi: Bigint

  tst: Timestamptz

  unique_vehicle_id: string

  veh: number

  vehicle_number: number
}

/** subscription root */
export interface SubscriptionRoot {
  /** fetch data from the table: "vehicles" */
  vehicles: Vehicles[]
}

// ====================================================
// Arguments
// ====================================================

export interface VehiclesQueryRootArgs {
  /** distinct select on columns */
  distinct_on?: Maybe<VehiclesSelectColumn[]>
  /** limit the nuber of rows returned */
  limit?: Maybe<number>
  /** skip the first n rows. Use only with order_by */
  offset?: Maybe<number>
  /** sort the rows by one or more columns */
  order_by?: Maybe<VehiclesOrderBy[]>
  /** filter the rows returned */
  where?: Maybe<VehiclesBoolExp>
}
export interface VehiclesSubscriptionRootArgs {
  /** distinct select on columns */
  distinct_on?: Maybe<VehiclesSelectColumn[]>
  /** limit the nuber of rows returned */
  limit?: Maybe<number>
  /** skip the first n rows. Use only with order_by */
  offset?: Maybe<number>
  /** sort the rows by one or more columns */
  order_by?: Maybe<VehiclesOrderBy[]>
  /** filter the rows returned */
  where?: Maybe<VehiclesBoolExp>
}
