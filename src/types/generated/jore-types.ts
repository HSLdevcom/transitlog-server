export type Maybe<T> = T | null

/** A condition to be used against `Departure` object types. All fields are tested for equality and combined with a logical ‘and.’ */
export interface DepartureCondition {
  /** Checks for equality with the object’s `stopId` field. */
  stopId?: Maybe<string>
  /** Checks for equality with the object’s `routeId` field. */
  routeId?: Maybe<string>
  /** Checks for equality with the object’s `direction` field. */
  direction?: Maybe<string>
  /** Checks for equality with the object’s `dayType` field. */
  dayType?: Maybe<string>
  /** Checks for equality with the object’s `departureId` field. */
  departureId?: Maybe<number>
  /** Checks for equality with the object’s `isNextDay` field. */
  isNextDay?: Maybe<boolean>
  /** Checks for equality with the object’s `hours` field. */
  hours?: Maybe<number>
  /** Checks for equality with the object’s `minutes` field. */
  minutes?: Maybe<number>
  /** Checks for equality with the object’s `isAccessible` field. */
  isAccessible?: Maybe<boolean>
  /** Checks for equality with the object’s `dateBegin` field. */
  dateBegin?: Maybe<Date>
  /** Checks for equality with the object’s `dateEnd` field. */
  dateEnd?: Maybe<Date>
  /** Checks for equality with the object’s `stopRole` field. */
  stopRole?: Maybe<number>
  /** Checks for equality with the object’s `vehicle` field. */
  vehicle?: Maybe<string>
  /** Checks for equality with the object’s `note` field. */
  note?: Maybe<string>
  /** Checks for equality with the object’s `arrivalIsNextDay` field. */
  arrivalIsNextDay?: Maybe<boolean>
  /** Checks for equality with the object’s `arrivalHours` field. */
  arrivalHours?: Maybe<number>
  /** Checks for equality with the object’s `arrivalMinutes` field. */
  arrivalMinutes?: Maybe<number>
  /** Checks for equality with the object’s `extraDeparture` field. */
  extraDeparture?: Maybe<string>
  /** Checks for equality with the object’s `terminalTime` field. */
  terminalTime?: Maybe<number>
  /** Checks for equality with the object’s `recoveryTime` field. */
  recoveryTime?: Maybe<number>
  /** Checks for equality with the object’s `equipmentType` field. */
  equipmentType?: Maybe<string>
  /** Checks for equality with the object’s `equipmentRequired` field. */
  equipmentRequired?: Maybe<number>
  /** Checks for equality with the object’s `bidTargetId` field. */
  bidTargetId?: Maybe<string>
  /** Checks for equality with the object’s `operatorId` field. */
  operatorId?: Maybe<string>
  /** Checks for equality with the object’s `availableOperators` field. */
  availableOperators?: Maybe<string>
  /** Checks for equality with the object’s `trunkColorRequired` field. */
  trunkColorRequired?: Maybe<number>
}
/** A condition to be used against `Stop` object types. All fields are tested for equality and combined with a logical ‘and.’ */
export interface StopCondition {
  /** Checks for equality with the object’s `stopId` field. */
  stopId?: Maybe<string>
  /** Checks for equality with the object’s `lat` field. */
  lat?: Maybe<BigFloat>
  /** Checks for equality with the object’s `lon` field. */
  lon?: Maybe<BigFloat>
  /** Checks for equality with the object’s `nameFi` field. */
  nameFi?: Maybe<string>
  /** Checks for equality with the object’s `nameSe` field. */
  nameSe?: Maybe<string>
  /** Checks for equality with the object’s `addressFi` field. */
  addressFi?: Maybe<string>
  /** Checks for equality with the object’s `addressSe` field. */
  addressSe?: Maybe<string>
  /** Checks for equality with the object’s `platform` field. */
  platform?: Maybe<string>
  /** Checks for equality with the object’s `shortId` field. */
  shortId?: Maybe<string>
  /** Checks for equality with the object’s `heading` field. */
  heading?: Maybe<string>
  /** Checks for equality with the object’s `stopRadius` field. */
  stopRadius?: Maybe<number>
  /** Checks for equality with the object’s `terminalId` field. */
  terminalId?: Maybe<string>
  /** Checks for equality with the object’s `stopAreaId` field. */
  stopAreaId?: Maybe<string>
  /** Checks for equality with the object’s `posterCount` field. */
  posterCount?: Maybe<number>
  /** Checks for equality with the object’s `drivebyTimetable` field. */
  drivebyTimetable?: Maybe<number>
  /** Checks for equality with the object’s `stopType` field. */
  stopType?: Maybe<string>
  /** Checks for equality with the object’s `distributionArea` field. */
  distributionArea?: Maybe<string>
  /** Checks for equality with the object’s `distributionOrder` field. */
  distributionOrder?: Maybe<number>
  /** Checks for equality with the object’s `stopZone` field. */
  stopZone?: Maybe<string>
  /** Checks for equality with the object’s `stopTariff` field. */
  stopTariff?: Maybe<string>
  /** Checks for equality with the object’s `point` field. */
  point?: Maybe<string>
}
/** A condition to be used against `Route` object types. All fields are tested for equality and combined with a logical ‘and.’ */
export interface RouteCondition {
  /** Checks for equality with the object’s `routeId` field. */
  routeId?: Maybe<string>
  /** Checks for equality with the object’s `dateBegin` field. */
  dateBegin?: Maybe<Date>
  /** Checks for equality with the object’s `dateEnd` field. */
  dateEnd?: Maybe<Date>
  /** Checks for equality with the object’s `direction` field. */
  direction?: Maybe<string>
  /** Checks for equality with the object’s `nameFi` field. */
  nameFi?: Maybe<string>
  /** Checks for equality with the object’s `nameSe` field. */
  nameSe?: Maybe<string>
  /** Checks for equality with the object’s `type` field. */
  type?: Maybe<string>
  /** Checks for equality with the object’s `originFi` field. */
  originFi?: Maybe<string>
  /** Checks for equality with the object’s `originSe` field. */
  originSe?: Maybe<string>
  /** Checks for equality with the object’s `originstopId` field. */
  originstopId?: Maybe<string>
  /** Checks for equality with the object’s `routeLength` field. */
  routeLength?: Maybe<number>
  /** Checks for equality with the object’s `destinationFi` field. */
  destinationFi?: Maybe<string>
  /** Checks for equality with the object’s `destinationSe` field. */
  destinationSe?: Maybe<string>
  /** Checks for equality with the object’s `destinationstopId` field. */
  destinationstopId?: Maybe<string>
}
/** A condition to be used against `RouteSegment` object types. All fields are tested for equality and combined with a logical ‘and.’ */
export interface RouteSegmentCondition {
  /** Checks for equality with the object’s `stopId` field. */
  stopId?: Maybe<string>
  /** Checks for equality with the object’s `nextStopId` field. */
  nextStopId?: Maybe<string>
  /** Checks for equality with the object’s `routeId` field. */
  routeId?: Maybe<string>
  /** Checks for equality with the object’s `direction` field. */
  direction?: Maybe<string>
  /** Checks for equality with the object’s `dateBegin` field. */
  dateBegin?: Maybe<Date>
  /** Checks for equality with the object’s `dateEnd` field. */
  dateEnd?: Maybe<Date>
  /** Checks for equality with the object’s `duration` field. */
  duration?: Maybe<number>
  /** Checks for equality with the object’s `stopIndex` field. */
  stopIndex?: Maybe<number>
  /** Checks for equality with the object’s `distanceFromPrevious` field. */
  distanceFromPrevious?: Maybe<number>
  /** Checks for equality with the object’s `distanceFromStart` field. */
  distanceFromStart?: Maybe<number>
  /** Checks for equality with the object’s `pickupDropoffType` field. */
  pickupDropoffType?: Maybe<number>
  /** Checks for equality with the object’s `destinationFi` field. */
  destinationFi?: Maybe<string>
  /** Checks for equality with the object’s `destinationSe` field. */
  destinationSe?: Maybe<string>
  /** Checks for equality with the object’s `viaFi` field. */
  viaFi?: Maybe<string>
  /** Checks for equality with the object’s `viaSe` field. */
  viaSe?: Maybe<string>
  /** Checks for equality with the object’s `timingStopType` field. */
  timingStopType?: Maybe<number>
}
/** A condition to be used against `Equipment` object types. All fields are tested for equality and combined with a logical ‘and.’ */
export interface EquipmentCondition {
  /** Checks for equality with the object’s `class` field. */
  class?: Maybe<string>
  /** Checks for equality with the object’s `registryNr` field. */
  registryNr?: Maybe<string>
  /** Checks for equality with the object’s `vehicleId` field. */
  vehicleId?: Maybe<string>
  /** Checks for equality with the object’s `age` field. */
  age?: Maybe<string>
  /** Checks for equality with the object’s `type` field. */
  type?: Maybe<string>
  /** Checks for equality with the object’s `multiAxle` field. */
  multiAxle?: Maybe<number>
  /** Checks for equality with the object’s `exteriorColor` field. */
  exteriorColor?: Maybe<string>
  /** Checks for equality with the object’s `operatorId` field. */
  operatorId?: Maybe<string>
  /** Checks for equality with the object’s `emissionClass` field. */
  emissionClass?: Maybe<string>
  /** Checks for equality with the object’s `emissionDesc` field. */
  emissionDesc?: Maybe<string>
}
/** A condition to be used against `Geometry` object types. All fields are tested for equality and combined with a logical ‘and.’ */
export interface GeometryCondition {
  /** Checks for equality with the object’s `routeId` field. */
  routeId?: Maybe<string>
  /** Checks for equality with the object’s `direction` field. */
  direction?: Maybe<string>
  /** Checks for equality with the object’s `dateBegin` field. */
  dateBegin?: Maybe<Date>
  /** Checks for equality with the object’s `dateEnd` field. */
  dateEnd?: Maybe<Date>
  /** Checks for equality with the object’s `geom` field. */
  geom?: Maybe<string>
}
/** A condition to be used against `Line` object types. All fields are tested for equality and combined with a logical ‘and.’ */
export interface LineCondition {
  /** Checks for equality with the object’s `lineId` field. */
  lineId?: Maybe<string>
  /** Checks for equality with the object’s `nameFi` field. */
  nameFi?: Maybe<string>
  /** Checks for equality with the object’s `nameSe` field. */
  nameSe?: Maybe<string>
  /** Checks for equality with the object’s `originFi` field. */
  originFi?: Maybe<string>
  /** Checks for equality with the object’s `originSe` field. */
  originSe?: Maybe<string>
  /** Checks for equality with the object’s `destinationFi` field. */
  destinationFi?: Maybe<string>
  /** Checks for equality with the object’s `destinationSe` field. */
  destinationSe?: Maybe<string>
  /** Checks for equality with the object’s `dateBegin` field. */
  dateBegin?: Maybe<Date>
  /** Checks for equality with the object’s `dateEnd` field. */
  dateEnd?: Maybe<Date>
}
/** A condition to be used against `Note` object types. All fields are tested for equality and combined with a logical ‘and.’ */
export interface NoteCondition {
  /** Checks for equality with the object’s `lineId` field. */
  lineId?: Maybe<string>
  /** Checks for equality with the object’s `noteId` field. */
  noteId?: Maybe<number>
  /** Checks for equality with the object’s `noteType` field. */
  noteType?: Maybe<string>
  /** Checks for equality with the object’s `noteText` field. */
  noteText?: Maybe<string>
  /** Checks for equality with the object’s `dateBegin` field. */
  dateBegin?: Maybe<Date>
  /** Checks for equality with the object’s `dateEnd` field. */
  dateEnd?: Maybe<Date>
}
/** A condition to be used against `PointGeometry` object types. All fields are tested for equality and combined with a logical ‘and.’ */
export interface PointGeometryCondition {
  /** Checks for equality with the object’s `routeId` field. */
  routeId?: Maybe<string>
  /** Checks for equality with the object’s `direction` field. */
  direction?: Maybe<string>
  /** Checks for equality with the object’s `dateBegin` field. */
  dateBegin?: Maybe<Date>
  /** Checks for equality with the object’s `dateEnd` field. */
  dateEnd?: Maybe<Date>
  /** Checks for equality with the object’s `stopId` field. */
  stopId?: Maybe<string>
  /** Checks for equality with the object’s `nodeType` field. */
  nodeType?: Maybe<string>
  /** Checks for equality with the object’s `index` field. */
  index?: Maybe<number>
  /** Checks for equality with the object’s `y` field. */
  y?: Maybe<number>
  /** Checks for equality with the object’s `x` field. */
  x?: Maybe<number>
  /** Checks for equality with the object’s `point` field. */
  point?: Maybe<string>
}
/** A condition to be used against `StopArea` object types. All fields are tested for equality and combined with a logical ‘and.’ */
export interface StopAreaCondition {
  /** Checks for equality with the object’s `stopAreaId` field. */
  stopAreaId?: Maybe<string>
  /** Checks for equality with the object’s `nameFi` field. */
  nameFi?: Maybe<string>
  /** Checks for equality with the object’s `nameSe` field. */
  nameSe?: Maybe<string>
  /** Checks for equality with the object’s `lat` field. */
  lat?: Maybe<BigFloat>
  /** Checks for equality with the object’s `lon` field. */
  lon?: Maybe<BigFloat>
  /** Checks for equality with the object’s `point` field. */
  point?: Maybe<string>
}
/** A condition to be used against `Terminal` object types. All fields are tested for equality and combined with a logical ‘and.’ */
export interface TerminalCondition {
  /** Checks for equality with the object’s `terminalId` field. */
  terminalId?: Maybe<string>
  /** Checks for equality with the object’s `nameFi` field. */
  nameFi?: Maybe<string>
  /** Checks for equality with the object’s `nameSe` field. */
  nameSe?: Maybe<string>
  /** Checks for equality with the object’s `lat` field. */
  lat?: Maybe<BigFloat>
  /** Checks for equality with the object’s `lon` field. */
  lon?: Maybe<BigFloat>
  /** Checks for equality with the object’s `point` field. */
  point?: Maybe<string>
}
/** Methods to use when ordering `Departure`. */
export enum DeparturesOrderBy {
  Natural = 'NATURAL',
  StopIdAsc = 'STOP_ID_ASC',
  StopIdDesc = 'STOP_ID_DESC',
  RouteIdAsc = 'ROUTE_ID_ASC',
  RouteIdDesc = 'ROUTE_ID_DESC',
  DirectionAsc = 'DIRECTION_ASC',
  DirectionDesc = 'DIRECTION_DESC',
  DayTypeAsc = 'DAY_TYPE_ASC',
  DayTypeDesc = 'DAY_TYPE_DESC',
  DepartureIdAsc = 'DEPARTURE_ID_ASC',
  DepartureIdDesc = 'DEPARTURE_ID_DESC',
  IsNextDayAsc = 'IS_NEXT_DAY_ASC',
  IsNextDayDesc = 'IS_NEXT_DAY_DESC',
  HoursAsc = 'HOURS_ASC',
  HoursDesc = 'HOURS_DESC',
  MinutesAsc = 'MINUTES_ASC',
  MinutesDesc = 'MINUTES_DESC',
  IsAccessibleAsc = 'IS_ACCESSIBLE_ASC',
  IsAccessibleDesc = 'IS_ACCESSIBLE_DESC',
  DateBeginAsc = 'DATE_BEGIN_ASC',
  DateBeginDesc = 'DATE_BEGIN_DESC',
  DateEndAsc = 'DATE_END_ASC',
  DateEndDesc = 'DATE_END_DESC',
  StopRoleAsc = 'STOP_ROLE_ASC',
  StopRoleDesc = 'STOP_ROLE_DESC',
  VehicleAsc = 'VEHICLE_ASC',
  VehicleDesc = 'VEHICLE_DESC',
  NoteAsc = 'NOTE_ASC',
  NoteDesc = 'NOTE_DESC',
  ArrivalIsNextDayAsc = 'ARRIVAL_IS_NEXT_DAY_ASC',
  ArrivalIsNextDayDesc = 'ARRIVAL_IS_NEXT_DAY_DESC',
  ArrivalHoursAsc = 'ARRIVAL_HOURS_ASC',
  ArrivalHoursDesc = 'ARRIVAL_HOURS_DESC',
  ArrivalMinutesAsc = 'ARRIVAL_MINUTES_ASC',
  ArrivalMinutesDesc = 'ARRIVAL_MINUTES_DESC',
  ExtraDepartureAsc = 'EXTRA_DEPARTURE_ASC',
  ExtraDepartureDesc = 'EXTRA_DEPARTURE_DESC',
  TerminalTimeAsc = 'TERMINAL_TIME_ASC',
  TerminalTimeDesc = 'TERMINAL_TIME_DESC',
  RecoveryTimeAsc = 'RECOVERY_TIME_ASC',
  RecoveryTimeDesc = 'RECOVERY_TIME_DESC',
  EquipmentTypeAsc = 'EQUIPMENT_TYPE_ASC',
  EquipmentTypeDesc = 'EQUIPMENT_TYPE_DESC',
  EquipmentRequiredAsc = 'EQUIPMENT_REQUIRED_ASC',
  EquipmentRequiredDesc = 'EQUIPMENT_REQUIRED_DESC',
  BidTargetIdAsc = 'BID_TARGET_ID_ASC',
  BidTargetIdDesc = 'BID_TARGET_ID_DESC',
  OperatorIdAsc = 'OPERATOR_ID_ASC',
  OperatorIdDesc = 'OPERATOR_ID_DESC',
  AvailableOperatorsAsc = 'AVAILABLE_OPERATORS_ASC',
  AvailableOperatorsDesc = 'AVAILABLE_OPERATORS_DESC',
  TrunkColorRequiredAsc = 'TRUNK_COLOR_REQUIRED_ASC',
  TrunkColorRequiredDesc = 'TRUNK_COLOR_REQUIRED_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
}
/** Methods to use when ordering `Stop`. */
export enum StopsOrderBy {
  Natural = 'NATURAL',
  StopIdAsc = 'STOP_ID_ASC',
  StopIdDesc = 'STOP_ID_DESC',
  LatAsc = 'LAT_ASC',
  LatDesc = 'LAT_DESC',
  LonAsc = 'LON_ASC',
  LonDesc = 'LON_DESC',
  NameFiAsc = 'NAME_FI_ASC',
  NameFiDesc = 'NAME_FI_DESC',
  NameSeAsc = 'NAME_SE_ASC',
  NameSeDesc = 'NAME_SE_DESC',
  AddressFiAsc = 'ADDRESS_FI_ASC',
  AddressFiDesc = 'ADDRESS_FI_DESC',
  AddressSeAsc = 'ADDRESS_SE_ASC',
  AddressSeDesc = 'ADDRESS_SE_DESC',
  PlatformAsc = 'PLATFORM_ASC',
  PlatformDesc = 'PLATFORM_DESC',
  ShortIdAsc = 'SHORT_ID_ASC',
  ShortIdDesc = 'SHORT_ID_DESC',
  HeadingAsc = 'HEADING_ASC',
  HeadingDesc = 'HEADING_DESC',
  StopRadiusAsc = 'STOP_RADIUS_ASC',
  StopRadiusDesc = 'STOP_RADIUS_DESC',
  TerminalIdAsc = 'TERMINAL_ID_ASC',
  TerminalIdDesc = 'TERMINAL_ID_DESC',
  StopAreaIdAsc = 'STOP_AREA_ID_ASC',
  StopAreaIdDesc = 'STOP_AREA_ID_DESC',
  PosterCountAsc = 'POSTER_COUNT_ASC',
  PosterCountDesc = 'POSTER_COUNT_DESC',
  DrivebyTimetableAsc = 'DRIVEBY_TIMETABLE_ASC',
  DrivebyTimetableDesc = 'DRIVEBY_TIMETABLE_DESC',
  StopTypeAsc = 'STOP_TYPE_ASC',
  StopTypeDesc = 'STOP_TYPE_DESC',
  DistributionAreaAsc = 'DISTRIBUTION_AREA_ASC',
  DistributionAreaDesc = 'DISTRIBUTION_AREA_DESC',
  DistributionOrderAsc = 'DISTRIBUTION_ORDER_ASC',
  DistributionOrderDesc = 'DISTRIBUTION_ORDER_DESC',
  StopZoneAsc = 'STOP_ZONE_ASC',
  StopZoneDesc = 'STOP_ZONE_DESC',
  StopTariffAsc = 'STOP_TARIFF_ASC',
  StopTariffDesc = 'STOP_TARIFF_DESC',
  PointAsc = 'POINT_ASC',
  PointDesc = 'POINT_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
}

export enum Mode {
  Bus = 'BUS',
  Tram = 'TRAM',
  Rail = 'RAIL',
  Subway = 'SUBWAY',
  Ferry = 'FERRY',
}
/** Methods to use when ordering `Route`. */
export enum RoutesOrderBy {
  Natural = 'NATURAL',
  RouteIdAsc = 'ROUTE_ID_ASC',
  RouteIdDesc = 'ROUTE_ID_DESC',
  DateBeginAsc = 'DATE_BEGIN_ASC',
  DateBeginDesc = 'DATE_BEGIN_DESC',
  DateEndAsc = 'DATE_END_ASC',
  DateEndDesc = 'DATE_END_DESC',
  DirectionAsc = 'DIRECTION_ASC',
  DirectionDesc = 'DIRECTION_DESC',
  NameFiAsc = 'NAME_FI_ASC',
  NameFiDesc = 'NAME_FI_DESC',
  NameSeAsc = 'NAME_SE_ASC',
  NameSeDesc = 'NAME_SE_DESC',
  TypeAsc = 'TYPE_ASC',
  TypeDesc = 'TYPE_DESC',
  OriginFiAsc = 'ORIGIN_FI_ASC',
  OriginFiDesc = 'ORIGIN_FI_DESC',
  OriginSeAsc = 'ORIGIN_SE_ASC',
  OriginSeDesc = 'ORIGIN_SE_DESC',
  OriginstopIdAsc = 'ORIGINSTOP_ID_ASC',
  OriginstopIdDesc = 'ORIGINSTOP_ID_DESC',
  RouteLengthAsc = 'ROUTE_LENGTH_ASC',
  RouteLengthDesc = 'ROUTE_LENGTH_DESC',
  DestinationFiAsc = 'DESTINATION_FI_ASC',
  DestinationFiDesc = 'DESTINATION_FI_DESC',
  DestinationSeAsc = 'DESTINATION_SE_ASC',
  DestinationSeDesc = 'DESTINATION_SE_DESC',
  DestinationstopIdAsc = 'DESTINATIONSTOP_ID_ASC',
  DestinationstopIdDesc = 'DESTINATIONSTOP_ID_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
}
/** Methods to use when ordering `RouteSegment`. */
export enum RouteSegmentsOrderBy {
  Natural = 'NATURAL',
  StopIdAsc = 'STOP_ID_ASC',
  StopIdDesc = 'STOP_ID_DESC',
  NextStopIdAsc = 'NEXT_STOP_ID_ASC',
  NextStopIdDesc = 'NEXT_STOP_ID_DESC',
  RouteIdAsc = 'ROUTE_ID_ASC',
  RouteIdDesc = 'ROUTE_ID_DESC',
  DirectionAsc = 'DIRECTION_ASC',
  DirectionDesc = 'DIRECTION_DESC',
  DateBeginAsc = 'DATE_BEGIN_ASC',
  DateBeginDesc = 'DATE_BEGIN_DESC',
  DateEndAsc = 'DATE_END_ASC',
  DateEndDesc = 'DATE_END_DESC',
  DurationAsc = 'DURATION_ASC',
  DurationDesc = 'DURATION_DESC',
  StopIndexAsc = 'STOP_INDEX_ASC',
  StopIndexDesc = 'STOP_INDEX_DESC',
  DistanceFromPreviousAsc = 'DISTANCE_FROM_PREVIOUS_ASC',
  DistanceFromPreviousDesc = 'DISTANCE_FROM_PREVIOUS_DESC',
  DistanceFromStartAsc = 'DISTANCE_FROM_START_ASC',
  DistanceFromStartDesc = 'DISTANCE_FROM_START_DESC',
  PickupDropoffTypeAsc = 'PICKUP_DROPOFF_TYPE_ASC',
  PickupDropoffTypeDesc = 'PICKUP_DROPOFF_TYPE_DESC',
  DestinationFiAsc = 'DESTINATION_FI_ASC',
  DestinationFiDesc = 'DESTINATION_FI_DESC',
  DestinationSeAsc = 'DESTINATION_SE_ASC',
  DestinationSeDesc = 'DESTINATION_SE_DESC',
  ViaFiAsc = 'VIA_FI_ASC',
  ViaFiDesc = 'VIA_FI_DESC',
  ViaSeAsc = 'VIA_SE_ASC',
  ViaSeDesc = 'VIA_SE_DESC',
  TimingStopTypeAsc = 'TIMING_STOP_TYPE_ASC',
  TimingStopTypeDesc = 'TIMING_STOP_TYPE_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
}
/** Methods to use when ordering `Equipment`. */
export enum EquipmentOrderBy {
  Natural = 'NATURAL',
  ClassAsc = 'CLASS_ASC',
  ClassDesc = 'CLASS_DESC',
  RegistryNrAsc = 'REGISTRY_NR_ASC',
  RegistryNrDesc = 'REGISTRY_NR_DESC',
  VehicleIdAsc = 'VEHICLE_ID_ASC',
  VehicleIdDesc = 'VEHICLE_ID_DESC',
  AgeAsc = 'AGE_ASC',
  AgeDesc = 'AGE_DESC',
  TypeAsc = 'TYPE_ASC',
  TypeDesc = 'TYPE_DESC',
  MultiAxleAsc = 'MULTI_AXLE_ASC',
  MultiAxleDesc = 'MULTI_AXLE_DESC',
  ExteriorColorAsc = 'EXTERIOR_COLOR_ASC',
  ExteriorColorDesc = 'EXTERIOR_COLOR_DESC',
  OperatorIdAsc = 'OPERATOR_ID_ASC',
  OperatorIdDesc = 'OPERATOR_ID_DESC',
  EmissionClassAsc = 'EMISSION_CLASS_ASC',
  EmissionClassDesc = 'EMISSION_CLASS_DESC',
  EmissionDescAsc = 'EMISSION_DESC_ASC',
  EmissionDescDesc = 'EMISSION_DESC_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
}
/** Methods to use when ordering `Geometry`. */
export enum GeometriesOrderBy {
  Natural = 'NATURAL',
  RouteIdAsc = 'ROUTE_ID_ASC',
  RouteIdDesc = 'ROUTE_ID_DESC',
  DirectionAsc = 'DIRECTION_ASC',
  DirectionDesc = 'DIRECTION_DESC',
  DateBeginAsc = 'DATE_BEGIN_ASC',
  DateBeginDesc = 'DATE_BEGIN_DESC',
  DateEndAsc = 'DATE_END_ASC',
  DateEndDesc = 'DATE_END_DESC',
  GeomAsc = 'GEOM_ASC',
  GeomDesc = 'GEOM_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
}
/** Methods to use when ordering `Line`. */
export enum LinesOrderBy {
  Natural = 'NATURAL',
  LineIdAsc = 'LINE_ID_ASC',
  LineIdDesc = 'LINE_ID_DESC',
  NameFiAsc = 'NAME_FI_ASC',
  NameFiDesc = 'NAME_FI_DESC',
  NameSeAsc = 'NAME_SE_ASC',
  NameSeDesc = 'NAME_SE_DESC',
  OriginFiAsc = 'ORIGIN_FI_ASC',
  OriginFiDesc = 'ORIGIN_FI_DESC',
  OriginSeAsc = 'ORIGIN_SE_ASC',
  OriginSeDesc = 'ORIGIN_SE_DESC',
  DestinationFiAsc = 'DESTINATION_FI_ASC',
  DestinationFiDesc = 'DESTINATION_FI_DESC',
  DestinationSeAsc = 'DESTINATION_SE_ASC',
  DestinationSeDesc = 'DESTINATION_SE_DESC',
  DateBeginAsc = 'DATE_BEGIN_ASC',
  DateBeginDesc = 'DATE_BEGIN_DESC',
  DateEndAsc = 'DATE_END_ASC',
  DateEndDesc = 'DATE_END_DESC',
}
/** Methods to use when ordering `Note`. */
export enum NotesOrderBy {
  Natural = 'NATURAL',
  LineIdAsc = 'LINE_ID_ASC',
  LineIdDesc = 'LINE_ID_DESC',
  NoteIdAsc = 'NOTE_ID_ASC',
  NoteIdDesc = 'NOTE_ID_DESC',
  NoteTypeAsc = 'NOTE_TYPE_ASC',
  NoteTypeDesc = 'NOTE_TYPE_DESC',
  NoteTextAsc = 'NOTE_TEXT_ASC',
  NoteTextDesc = 'NOTE_TEXT_DESC',
  DateBeginAsc = 'DATE_BEGIN_ASC',
  DateBeginDesc = 'DATE_BEGIN_DESC',
  DateEndAsc = 'DATE_END_ASC',
  DateEndDesc = 'DATE_END_DESC',
}
/** Methods to use when ordering `PointGeometry`. */
export enum PointGeometriesOrderBy {
  Natural = 'NATURAL',
  RouteIdAsc = 'ROUTE_ID_ASC',
  RouteIdDesc = 'ROUTE_ID_DESC',
  DirectionAsc = 'DIRECTION_ASC',
  DirectionDesc = 'DIRECTION_DESC',
  DateBeginAsc = 'DATE_BEGIN_ASC',
  DateBeginDesc = 'DATE_BEGIN_DESC',
  DateEndAsc = 'DATE_END_ASC',
  DateEndDesc = 'DATE_END_DESC',
  StopIdAsc = 'STOP_ID_ASC',
  StopIdDesc = 'STOP_ID_DESC',
  NodeTypeAsc = 'NODE_TYPE_ASC',
  NodeTypeDesc = 'NODE_TYPE_DESC',
  IndexAsc = 'INDEX_ASC',
  IndexDesc = 'INDEX_DESC',
  YAsc = 'Y_ASC',
  YDesc = 'Y_DESC',
  XAsc = 'X_ASC',
  XDesc = 'X_DESC',
  PointAsc = 'POINT_ASC',
  PointDesc = 'POINT_DESC',
}
/** Methods to use when ordering `StopArea`. */
export enum StopAreasOrderBy {
  Natural = 'NATURAL',
  StopAreaIdAsc = 'STOP_AREA_ID_ASC',
  StopAreaIdDesc = 'STOP_AREA_ID_DESC',
  NameFiAsc = 'NAME_FI_ASC',
  NameFiDesc = 'NAME_FI_DESC',
  NameSeAsc = 'NAME_SE_ASC',
  NameSeDesc = 'NAME_SE_DESC',
  LatAsc = 'LAT_ASC',
  LatDesc = 'LAT_DESC',
  LonAsc = 'LON_ASC',
  LonDesc = 'LON_DESC',
  PointAsc = 'POINT_ASC',
  PointDesc = 'POINT_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
}
/** Methods to use when ordering `Terminal`. */
export enum TerminalsOrderBy {
  Natural = 'NATURAL',
  TerminalIdAsc = 'TERMINAL_ID_ASC',
  TerminalIdDesc = 'TERMINAL_ID_DESC',
  NameFiAsc = 'NAME_FI_ASC',
  NameFiDesc = 'NAME_FI_DESC',
  NameSeAsc = 'NAME_SE_ASC',
  NameSeDesc = 'NAME_SE_DESC',
  LatAsc = 'LAT_ASC',
  LatDesc = 'LAT_DESC',
  LonAsc = 'LON_ASC',
  LonDesc = 'LON_DESC',
  PointAsc = 'POINT_ASC',
  PointDesc = 'POINT_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
}

/** A location in a connection that can be used for resuming pagination. */
export type Cursor = any

/** The day, does not include a time. */
export type Date = any

/** A floating point number that requires more precision than IEEE 754 binary 64 */
export type BigFloat = any

/** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
export type Json = any

// ====================================================
// Scalars
// ====================================================

// ====================================================
// Interfaces
// ====================================================

/** An object with a globally unique `ID`. */
export interface Node {
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: string
}

// ====================================================
// Types
// ====================================================

/** The root query type which gives access points into the data universe. */
export interface Query extends Node {
  /** Exposes the root query type nested one level down. This is helpful for Relay 1 which can only query top level fields if they are in a particular form. */
  query: Query
  /** The root query type must be a `Node` to work well with Relay 1 mutations. This just resolves to `query`. */
  nodeId: string
  /** Fetches an object given its globally unique `ID`. */
  node?: Maybe<Node>
  /** Reads and enables pagination through a set of `Departure`. */
  allDepartures?: Maybe<DeparturesConnection>
  /** Reads and enables pagination through a set of `Equipment`. */
  allEquipment?: Maybe<EquipmentConnection>
  /** Reads and enables pagination through a set of `Geometry`. */
  allGeometries?: Maybe<GeometriesConnection>
  /** Reads and enables pagination through a set of `Line`. */
  allLines?: Maybe<LinesConnection>
  /** Reads and enables pagination through a set of `Note`. */
  allNotes?: Maybe<NotesConnection>
  /** Reads and enables pagination through a set of `PointGeometry`. */
  allPointGeometries?: Maybe<PointGeometriesConnection>
  /** Reads and enables pagination through a set of `Route`. */
  allRoutes?: Maybe<RoutesConnection>
  /** Reads and enables pagination through a set of `RouteSegment`. */
  allRouteSegments?: Maybe<RouteSegmentsConnection>
  /** Reads and enables pagination through a set of `Stop`. */
  allStops?: Maybe<StopsConnection>
  /** Reads and enables pagination through a set of `StopArea`. */
  allStopAreas?: Maybe<StopAreasConnection>
  /** Reads and enables pagination through a set of `Terminal`. */
  allTerminals?: Maybe<TerminalsConnection>

  departureByRouteIdAndDirectionAndDateBeginAndDateEndAndHoursAndMinutesAndStopIdAndDayTypeAndExtraDeparture?: Maybe<
    Departure
  >

  equipmentByRegistryNr?: Maybe<Equipment>

  geometryByRouteIdAndDirectionAndDateBeginAndDateEnd?: Maybe<Geometry>

  lineByLineIdAndDateBeginAndDateEnd?: Maybe<Line>

  noteByLineIdAndNoteIdAndNoteType?: Maybe<Note>

  routeByRouteIdAndDirectionAndDateBeginAndDateEnd?: Maybe<Route>

  routeSegmentByRouteIdAndDirectionAndDateBeginAndDateEndAndStopId?: Maybe<RouteSegment>

  stopByStopId?: Maybe<Stop>

  stopAreaByStopAreaId?: Maybe<StopArea>

  terminalByTerminalId?: Maybe<Terminal>
  /** Reads and enables pagination through a set of `StopArea`. */
  stopAreasByBbox: StopAreasConnection
  /** Reads and enables pagination through a set of `StopGrouped`. */
  stopGroupedByShortIdByBbox: StopGroupedsConnection
  /** Reads and enables pagination through a set of `Stop`. */
  stopsByBbox: StopsConnection
  /** Reads and enables pagination through a set of `Terminal`. */
  terminalsByBbox: TerminalsConnection
  /** Reads a single `Departure` using its globally unique `ID`. */
  departure?: Maybe<Departure>
  /** Reads a single `Equipment` using its globally unique `ID`. */
  equipment?: Maybe<Equipment>
  /** Reads a single `Geometry` using its globally unique `ID`. */
  geometry?: Maybe<Geometry>
  /** Reads a single `Route` using its globally unique `ID`. */
  route?: Maybe<Route>
  /** Reads a single `RouteSegment` using its globally unique `ID`. */
  routeSegment?: Maybe<RouteSegment>
  /** Reads a single `Stop` using its globally unique `ID`. */
  stop?: Maybe<Stop>
  /** Reads a single `StopArea` using its globally unique `ID`. */
  stopArea?: Maybe<StopArea>
  /** Reads a single `Terminal` using its globally unique `ID`. */
  terminal?: Maybe<Terminal>
}

/** A connection to a list of `Departure` values. */
export interface DeparturesConnection {
  /** A list of `Departure` objects. */
  nodes: Array<Maybe<Departure>>
  /** A list of edges which contains the `Departure` and cursor to aid in pagination. */
  edges: DeparturesEdge[]
  /** Information to aid in pagination. */
  pageInfo: PageInfo
  /** The count of *all* `Departure` you could get from the connection. */
  totalCount?: Maybe<number>
}

export interface Departure extends Node {
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: string

  stopId: string

  routeId: string

  direction: string

  dayType: string

  departureId: number

  isNextDay: boolean

  hours: number

  minutes: number

  isAccessible: boolean

  dateBegin: Date

  dateEnd: Date

  stopRole: number

  vehicle?: Maybe<string>

  note?: Maybe<string>

  arrivalIsNextDay: boolean

  arrivalHours: number

  arrivalMinutes: number

  extraDeparture: string

  terminalTime?: Maybe<number>

  recoveryTime?: Maybe<number>

  equipmentType?: Maybe<string>

  equipmentRequired?: Maybe<number>

  bidTargetId?: Maybe<string>

  operatorId?: Maybe<string>

  availableOperators?: Maybe<string>

  trunkColorRequired?: Maybe<number>
  /** Reads a single `Stop` that is related to this `Departure`. */
  stopByStopId?: Maybe<Stop>

  isRegularDayDeparture?: Maybe<boolean>

  originDeparture?: Maybe<Departure>
}

export interface Stop extends Node {
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: string

  stopId: string

  lat: BigFloat

  lon: BigFloat

  nameFi: string

  nameSe?: Maybe<string>

  addressFi?: Maybe<string>

  addressSe?: Maybe<string>

  platform?: Maybe<string>

  shortId: string

  heading?: Maybe<string>

  stopRadius?: Maybe<number>

  terminalId?: Maybe<string>

  stopAreaId?: Maybe<string>

  posterCount?: Maybe<number>

  drivebyTimetable?: Maybe<number>

  stopType?: Maybe<string>

  distributionArea?: Maybe<string>

  distributionOrder?: Maybe<number>

  stopZone?: Maybe<string>

  stopTariff?: Maybe<string>

  point?: Maybe<string>
  /** Reads a single `Terminal` that is related to this `Stop`. */
  terminalByTerminalId?: Maybe<Terminal>
  /** Reads a single `StopArea` that is related to this `Stop`. */
  stopAreaByStopAreaId?: Maybe<StopArea>
  /** Reads and enables pagination through a set of `Route`. */
  routesByOriginstopId: RoutesConnection
  /** Reads and enables pagination through a set of `Route`. */
  routesByDestinationstopId: RoutesConnection
  /** Reads and enables pagination through a set of `RouteSegment`. */
  routeSegmentsByStopId: RouteSegmentsConnection
  /** Reads and enables pagination through a set of `Departure`. */
  departuresByStopId: DeparturesConnection
  /** Reads and enables pagination through a set of `Departure`. */
  departuresForDate: DeparturesConnection
  /** Reads and enables pagination through a set of `DepartureGroup`. */
  departuresGrouped: DepartureGroupsConnection

  modes: StopModesConnection
  /** Reads and enables pagination through a set of `RouteSegment`. */
  routeSegmentsForDate: RouteSegmentsConnection
  /** Reads and enables pagination through a set of `Stop`. */
  siblings: StopsConnection
}

export interface Terminal extends Node {
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: string

  terminalId: string

  nameFi: string

  nameSe?: Maybe<string>

  lat?: Maybe<BigFloat>

  lon?: Maybe<BigFloat>

  point?: Maybe<string>
  /** Reads and enables pagination through a set of `Stop`. */
  stopsByTerminalId: StopsConnection

  modes: TerminalModesConnection
}

/** A connection to a list of `Stop` values. */
export interface StopsConnection {
  /** A list of `Stop` objects. */
  nodes: Array<Maybe<Stop>>
  /** A list of edges which contains the `Stop` and cursor to aid in pagination. */
  edges: StopsEdge[]
  /** Information to aid in pagination. */
  pageInfo: PageInfo
  /** The count of *all* `Stop` you could get from the connection. */
  totalCount?: Maybe<number>
}

/** A `Stop` edge in the connection. */
export interface StopsEdge {
  /** A cursor for use in pagination. */
  cursor?: Maybe<Cursor>
  /** The `Stop` at the end of the edge. */
  node?: Maybe<Stop>
}

/** Information about pagination in a connection. */
export interface PageInfo {
  /** When paginating forwards, are there more items? */
  hasNextPage: boolean
  /** When paginating backwards, are there more items? */
  hasPreviousPage: boolean
  /** When paginating backwards, the cursor to continue. */
  startCursor?: Maybe<Cursor>
  /** When paginating forwards, the cursor to continue. */
  endCursor?: Maybe<Cursor>
}

/** A connection to a list of `Mode` values. */
export interface TerminalModesConnection {
  /** A list of `Mode` objects. */
  nodes: Array<Maybe<Mode>>
  /** A list of edges which contains the `Mode` and cursor to aid in pagination. */
  edges: TerminalModeEdge[]
}

/** A `Mode` edge in the connection. */
export interface TerminalModeEdge {
  /** A cursor for use in pagination. */
  cursor?: Maybe<Cursor>
  /** The `Mode` at the end of the edge. */
  node?: Maybe<Mode>
}

export interface StopArea extends Node {
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: string

  stopAreaId: string

  nameFi: string

  nameSe?: Maybe<string>

  lat?: Maybe<BigFloat>

  lon?: Maybe<BigFloat>

  point?: Maybe<string>
  /** Reads and enables pagination through a set of `Stop`. */
  stopsByStopAreaId: StopsConnection
}

/** A connection to a list of `Route` values. */
export interface RoutesConnection {
  /** A list of `Route` objects. */
  nodes: Array<Maybe<Route>>
  /** A list of edges which contains the `Route` and cursor to aid in pagination. */
  edges: RoutesEdge[]
  /** Information to aid in pagination. */
  pageInfo: PageInfo
  /** The count of *all* `Route` you could get from the connection. */
  totalCount?: Maybe<number>
}

export interface Route extends Node {
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: string

  routeId: string

  dateBegin: Date

  dateEnd: Date

  direction: string

  nameFi: string

  nameSe?: Maybe<string>

  type: string

  originFi: string

  originSe?: Maybe<string>

  originstopId: string

  routeLength: number

  destinationFi: string

  destinationSe?: Maybe<string>

  destinationstopId: string
  /** Reads a single `Stop` that is related to this `Route`. */
  stopByOriginstopId?: Maybe<Stop>
  /** Reads a single `Stop` that is related to this `Route`. */
  stopByDestinationstopId?: Maybe<Stop>

  departureNotes?: Maybe<Note>
  /** Reads and enables pagination through a set of `Departure`. */
  departures: DeparturesConnection
  /** Reads and enables pagination through a set of `DepartureGroup`. */
  departuresGrouped: DepartureGroupsConnection
  /** Reads and enables pagination through a set of `GeometryWithDate`. */
  geometries: GeometryWithDatesConnection

  hasRegularDayDepartures?: Maybe<boolean>
  /** Reads and enables pagination through a set of `Line`. */
  line: LinesConnection

  mode?: Maybe<Mode>
  /** Reads and enables pagination through a set of `RouteSegment`. */
  routeSegments: RouteSegmentsConnection
}

export interface Note {
  lineId: string

  noteId: number

  noteType: string

  noteText: string

  dateBegin?: Maybe<Date>

  dateEnd?: Maybe<Date>
}

/** A connection to a list of `DepartureGroup` values. */
export interface DepartureGroupsConnection {
  /** A list of `DepartureGroup` objects. */
  nodes: Array<Maybe<DepartureGroup>>
  /** A list of edges which contains the `DepartureGroup` and cursor to aid in pagination. */
  edges: DepartureGroupsEdge[]
  /** Information to aid in pagination. */
  pageInfo: PageInfo
  /** The count of *all* `DepartureGroup` you could get from the connection. */
  totalCount?: Maybe<number>
}

export interface DepartureGroup {
  stopId?: Maybe<string>

  routeId?: Maybe<string>

  direction?: Maybe<string>

  dayType?: Maybe<Array<Maybe<string>>>

  isNextDay?: Maybe<boolean>

  hours?: Maybe<number>

  minutes?: Maybe<number>

  isAccessible?: Maybe<boolean>

  dateBegin?: Maybe<Date>

  dateEnd?: Maybe<Date>

  stopRole?: Maybe<number>

  note?: Maybe<string>

  vehicle?: Maybe<Array<Maybe<string>>>
}

/** A `DepartureGroup` edge in the connection. */
export interface DepartureGroupsEdge {
  /** A cursor for use in pagination. */
  cursor?: Maybe<Cursor>
  /** The `DepartureGroup` at the end of the edge. */
  node?: Maybe<DepartureGroup>
}

/** A connection to a list of `GeometryWithDate` values. */
export interface GeometryWithDatesConnection {
  /** A list of `GeometryWithDate` objects. */
  nodes: Array<Maybe<GeometryWithDate>>
  /** A list of edges which contains the `GeometryWithDate` and cursor to aid in pagination. */
  edges: GeometryWithDatesEdge[]
  /** Information to aid in pagination. */
  pageInfo: PageInfo
  /** The count of *all* `GeometryWithDate` you could get from the connection. */
  totalCount?: Maybe<number>
}

export interface GeometryWithDate {
  geometry?: Maybe<Json>

  dateBegin?: Maybe<Date>

  dateEnd?: Maybe<Date>
}

/** A `GeometryWithDate` edge in the connection. */
export interface GeometryWithDatesEdge {
  /** A cursor for use in pagination. */
  cursor?: Maybe<Cursor>
  /** The `GeometryWithDate` at the end of the edge. */
  node?: Maybe<GeometryWithDate>
}

/** A connection to a list of `Line` values. */
export interface LinesConnection {
  /** A list of `Line` objects. */
  nodes: Array<Maybe<Line>>
  /** A list of edges which contains the `Line` and cursor to aid in pagination. */
  edges: LinesEdge[]
  /** Information to aid in pagination. */
  pageInfo: PageInfo
  /** The count of *all* `Line` you could get from the connection. */
  totalCount?: Maybe<number>
}

export interface Line {
  lineId: string

  nameFi: string

  nameSe?: Maybe<string>

  originFi: string

  originSe?: Maybe<string>

  destinationFi?: Maybe<string>

  destinationSe?: Maybe<string>

  dateBegin: Date

  dateEnd: Date
  /** Reads and enables pagination through a set of `Note`. */
  notes: NotesConnection
  /** Reads and enables pagination through a set of `Route`. */
  routes: RoutesConnection
}

/** A connection to a list of `Note` values. */
export interface NotesConnection {
  /** A list of `Note` objects. */
  nodes: Array<Maybe<Note>>
  /** A list of edges which contains the `Note` and cursor to aid in pagination. */
  edges: NotesEdge[]
  /** Information to aid in pagination. */
  pageInfo: PageInfo
  /** The count of *all* `Note` you could get from the connection. */
  totalCount?: Maybe<number>
}

/** A `Note` edge in the connection. */
export interface NotesEdge {
  /** A cursor for use in pagination. */
  cursor?: Maybe<Cursor>
  /** The `Note` at the end of the edge. */
  node?: Maybe<Note>
}

/** A `Line` edge in the connection. */
export interface LinesEdge {
  /** A cursor for use in pagination. */
  cursor?: Maybe<Cursor>
  /** The `Line` at the end of the edge. */
  node?: Maybe<Line>
}

/** A connection to a list of `RouteSegment` values. */
export interface RouteSegmentsConnection {
  /** A list of `RouteSegment` objects. */
  nodes: Array<Maybe<RouteSegment>>
  /** A list of edges which contains the `RouteSegment` and cursor to aid in pagination. */
  edges: RouteSegmentsEdge[]
  /** Information to aid in pagination. */
  pageInfo: PageInfo
  /** The count of *all* `RouteSegment` you could get from the connection. */
  totalCount?: Maybe<number>
}

export interface RouteSegment extends Node {
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: string

  stopId: string

  nextStopId?: Maybe<string>

  routeId: string

  direction: string

  dateBegin: Date

  dateEnd: Date

  duration: number

  stopIndex: number

  distanceFromPrevious: number

  distanceFromStart: number

  pickupDropoffType?: Maybe<number>

  destinationFi?: Maybe<string>

  destinationSe?: Maybe<string>

  viaFi?: Maybe<string>

  viaSe?: Maybe<string>

  timingStopType: number
  /** Reads a single `Stop` that is related to this `RouteSegment`. */
  stopByStopId?: Maybe<Stop>

  departureNotes?: Maybe<Note>
  /** Reads and enables pagination through a set of `DepartureGroup`. */
  departuresGrouped: DepartureGroupsConnection

  hasRegularDayDepartures?: Maybe<boolean>
  /** Reads and enables pagination through a set of `Line`. */
  line: LinesConnection
  /** Reads and enables pagination through a set of `RouteSegment`. */
  nextStops: RouteSegmentsConnection
  /** Reads and enables pagination through a set of `Note`. */
  notes: NotesConnection
  /** Reads and enables pagination through a set of `Route`. */
  route: RoutesConnection
}

/** A `RouteSegment` edge in the connection. */
export interface RouteSegmentsEdge {
  /** A cursor for use in pagination. */
  cursor?: Maybe<Cursor>
  /** The `RouteSegment` at the end of the edge. */
  node?: Maybe<RouteSegment>
}

/** A `Route` edge in the connection. */
export interface RoutesEdge {
  /** A cursor for use in pagination. */
  cursor?: Maybe<Cursor>
  /** The `Route` at the end of the edge. */
  node?: Maybe<Route>
}

/** A connection to a list of `Mode` values. */
export interface StopModesConnection {
  /** A list of `Mode` objects. */
  nodes: Array<Maybe<Mode>>
  /** A list of edges which contains the `Mode` and cursor to aid in pagination. */
  edges: StopModeEdge[]
}

/** A `Mode` edge in the connection. */
export interface StopModeEdge {
  /** A cursor for use in pagination. */
  cursor?: Maybe<Cursor>
  /** The `Mode` at the end of the edge. */
  node?: Maybe<Mode>
}

/** A `Departure` edge in the connection. */
export interface DeparturesEdge {
  /** A cursor for use in pagination. */
  cursor?: Maybe<Cursor>
  /** The `Departure` at the end of the edge. */
  node?: Maybe<Departure>
}

/** A connection to a list of `Equipment` values. */
export interface EquipmentConnection {
  /** A list of `Equipment` objects. */
  nodes: Array<Maybe<Equipment>>
  /** A list of edges which contains the `Equipment` and cursor to aid in pagination. */
  edges: EquipmentEdge[]
  /** Information to aid in pagination. */
  pageInfo: PageInfo
  /** The count of *all* `Equipment` you could get from the connection. */
  totalCount?: Maybe<number>
}

export interface Equipment extends Node {
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: string

  class?: Maybe<string>

  registryNr: string

  vehicleId: string

  age?: Maybe<string>

  type?: Maybe<string>

  multiAxle?: Maybe<number>

  exteriorColor?: Maybe<string>

  operatorId?: Maybe<string>

  emissionClass?: Maybe<string>

  emissionDesc?: Maybe<string>
}

/** A `Equipment` edge in the connection. */
export interface EquipmentEdge {
  /** A cursor for use in pagination. */
  cursor?: Maybe<Cursor>
  /** The `Equipment` at the end of the edge. */
  node?: Maybe<Equipment>
}

/** A connection to a list of `Geometry` values. */
export interface GeometriesConnection {
  /** A list of `Geometry` objects. */
  nodes: Array<Maybe<Geometry>>
  /** A list of edges which contains the `Geometry` and cursor to aid in pagination. */
  edges: GeometriesEdge[]
  /** Information to aid in pagination. */
  pageInfo: PageInfo
  /** The count of *all* `Geometry` you could get from the connection. */
  totalCount?: Maybe<number>
}

export interface Geometry extends Node {
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: string

  routeId: string

  direction: string

  dateBegin: Date

  dateEnd: Date

  geom: string
}

/** A `Geometry` edge in the connection. */
export interface GeometriesEdge {
  /** A cursor for use in pagination. */
  cursor?: Maybe<Cursor>
  /** The `Geometry` at the end of the edge. */
  node?: Maybe<Geometry>
}

/** A connection to a list of `PointGeometry` values. */
export interface PointGeometriesConnection {
  /** A list of `PointGeometry` objects. */
  nodes: Array<Maybe<PointGeometry>>
  /** A list of edges which contains the `PointGeometry` and cursor to aid in pagination. */
  edges: PointGeometriesEdge[]
  /** Information to aid in pagination. */
  pageInfo: PageInfo
  /** The count of *all* `PointGeometry` you could get from the connection. */
  totalCount?: Maybe<number>
}

export interface PointGeometry {
  routeId: string

  direction: string

  dateBegin: Date

  dateEnd: Date

  stopId: string

  nodeType: string

  index: number

  y: number

  x: number

  point?: Maybe<string>
}

/** A `PointGeometry` edge in the connection. */
export interface PointGeometriesEdge {
  /** A cursor for use in pagination. */
  cursor?: Maybe<Cursor>
  /** The `PointGeometry` at the end of the edge. */
  node?: Maybe<PointGeometry>
}

/** A connection to a list of `StopArea` values. */
export interface StopAreasConnection {
  /** A list of `StopArea` objects. */
  nodes: Array<Maybe<StopArea>>
  /** A list of edges which contains the `StopArea` and cursor to aid in pagination. */
  edges: StopAreasEdge[]
  /** Information to aid in pagination. */
  pageInfo: PageInfo
  /** The count of *all* `StopArea` you could get from the connection. */
  totalCount?: Maybe<number>
}

/** A `StopArea` edge in the connection. */
export interface StopAreasEdge {
  /** A cursor for use in pagination. */
  cursor?: Maybe<Cursor>
  /** The `StopArea` at the end of the edge. */
  node?: Maybe<StopArea>
}

/** A connection to a list of `Terminal` values. */
export interface TerminalsConnection {
  /** A list of `Terminal` objects. */
  nodes: Array<Maybe<Terminal>>
  /** A list of edges which contains the `Terminal` and cursor to aid in pagination. */
  edges: TerminalsEdge[]
  /** Information to aid in pagination. */
  pageInfo: PageInfo
  /** The count of *all* `Terminal` you could get from the connection. */
  totalCount?: Maybe<number>
}

/** A `Terminal` edge in the connection. */
export interface TerminalsEdge {
  /** A cursor for use in pagination. */
  cursor?: Maybe<Cursor>
  /** The `Terminal` at the end of the edge. */
  node?: Maybe<Terminal>
}

/** A connection to a list of `StopGrouped` values. */
export interface StopGroupedsConnection {
  /** A list of `StopGrouped` objects. */
  nodes: Array<Maybe<StopGrouped>>
  /** A list of edges which contains the `StopGrouped` and cursor to aid in pagination. */
  edges: StopGroupedsEdge[]
  /** Information to aid in pagination. */
  pageInfo: PageInfo
  /** The count of *all* `StopGrouped` you could get from the connection. */
  totalCount?: Maybe<number>
}

export interface StopGrouped {
  shortId?: Maybe<string>

  nameFi?: Maybe<string>

  nameSe?: Maybe<string>

  lat?: Maybe<BigFloat>

  lon?: Maybe<BigFloat>

  stopIds?: Maybe<Array<Maybe<string>>>
  /** Reads and enables pagination through a set of `Stop`. */
  stops: StopsConnection
}

/** A `StopGrouped` edge in the connection. */
export interface StopGroupedsEdge {
  /** A cursor for use in pagination. */
  cursor?: Maybe<Cursor>
  /** The `StopGrouped` at the end of the edge. */
  node?: Maybe<StopGrouped>
}

// ====================================================
// Arguments
// ====================================================

export interface NodeQueryArgs {
  /** The globally unique `ID`. */
  nodeId: string
}
export interface AllDeparturesQueryArgs {
  /** Only read the first `n` values of the set. */
  first?: Maybe<number>
  /** Only read the last `n` values of the set. */
  last?: Maybe<number>
  /** Skip the first `n` values from our `after` cursor, an alternative to cursor based pagination. May not be used with `last`. */
  offset?: Maybe<number>
  /** Read all values in the set before (above) this cursor. */
  before?: Maybe<Cursor>
  /** Read all values in the set after (below) this cursor. */
  after?: Maybe<Cursor>
  /** The method to use when ordering `Departure`. */
  orderBy?: DeparturesOrderBy[]
  /** A condition to be used in determining which values should be returned by the collection. */
  condition?: Maybe<DepartureCondition>
}
export interface AllEquipmentQueryArgs {
  /** Only read the first `n` values of the set. */
  first?: Maybe<number>
  /** Only read the last `n` values of the set. */
  last?: Maybe<number>
  /** Skip the first `n` values from our `after` cursor, an alternative to cursor based pagination. May not be used with `last`. */
  offset?: Maybe<number>
  /** Read all values in the set before (above) this cursor. */
  before?: Maybe<Cursor>
  /** Read all values in the set after (below) this cursor. */
  after?: Maybe<Cursor>
  /** The method to use when ordering `Equipment`. */
  orderBy?: EquipmentOrderBy[]
  /** A condition to be used in determining which values should be returned by the collection. */
  condition?: Maybe<EquipmentCondition>
}
export interface AllGeometriesQueryArgs {
  /** Only read the first `n` values of the set. */
  first?: Maybe<number>
  /** Only read the last `n` values of the set. */
  last?: Maybe<number>
  /** Skip the first `n` values from our `after` cursor, an alternative to cursor based pagination. May not be used with `last`. */
  offset?: Maybe<number>
  /** Read all values in the set before (above) this cursor. */
  before?: Maybe<Cursor>
  /** Read all values in the set after (below) this cursor. */
  after?: Maybe<Cursor>
  /** The method to use when ordering `Geometry`. */
  orderBy?: GeometriesOrderBy[]
  /** A condition to be used in determining which values should be returned by the collection. */
  condition?: Maybe<GeometryCondition>
}
export interface AllLinesQueryArgs {
  /** Only read the first `n` values of the set. */
  first?: Maybe<number>
  /** Only read the last `n` values of the set. */
  last?: Maybe<number>
  /** Skip the first `n` values from our `after` cursor, an alternative to cursor based pagination. May not be used with `last`. */
  offset?: Maybe<number>
  /** Read all values in the set before (above) this cursor. */
  before?: Maybe<Cursor>
  /** Read all values in the set after (below) this cursor. */
  after?: Maybe<Cursor>
  /** The method to use when ordering `Line`. */
  orderBy?: LinesOrderBy[]
  /** A condition to be used in determining which values should be returned by the collection. */
  condition?: Maybe<LineCondition>
}
export interface AllNotesQueryArgs {
  /** Only read the first `n` values of the set. */
  first?: Maybe<number>
  /** Only read the last `n` values of the set. */
  last?: Maybe<number>
  /** Skip the first `n` values from our `after` cursor, an alternative to cursor based pagination. May not be used with `last`. */
  offset?: Maybe<number>
  /** Read all values in the set before (above) this cursor. */
  before?: Maybe<Cursor>
  /** Read all values in the set after (below) this cursor. */
  after?: Maybe<Cursor>
  /** The method to use when ordering `Note`. */
  orderBy?: NotesOrderBy[]
  /** A condition to be used in determining which values should be returned by the collection. */
  condition?: Maybe<NoteCondition>
}
export interface AllPointGeometriesQueryArgs {
  /** Only read the first `n` values of the set. */
  first?: Maybe<number>
  /** Only read the last `n` values of the set. */
  last?: Maybe<number>
  /** Skip the first `n` values from our `after` cursor, an alternative to cursor based pagination. May not be used with `last`. */
  offset?: Maybe<number>
  /** Read all values in the set before (above) this cursor. */
  before?: Maybe<Cursor>
  /** Read all values in the set after (below) this cursor. */
  after?: Maybe<Cursor>
  /** The method to use when ordering `PointGeometry`. */
  orderBy?: PointGeometriesOrderBy[]
  /** A condition to be used in determining which values should be returned by the collection. */
  condition?: Maybe<PointGeometryCondition>
}
export interface AllRoutesQueryArgs {
  /** Only read the first `n` values of the set. */
  first?: Maybe<number>
  /** Only read the last `n` values of the set. */
  last?: Maybe<number>
  /** Skip the first `n` values from our `after` cursor, an alternative to cursor based pagination. May not be used with `last`. */
  offset?: Maybe<number>
  /** Read all values in the set before (above) this cursor. */
  before?: Maybe<Cursor>
  /** Read all values in the set after (below) this cursor. */
  after?: Maybe<Cursor>
  /** The method to use when ordering `Route`. */
  orderBy?: RoutesOrderBy[]
  /** A condition to be used in determining which values should be returned by the collection. */
  condition?: Maybe<RouteCondition>
}
export interface AllRouteSegmentsQueryArgs {
  /** Only read the first `n` values of the set. */
  first?: Maybe<number>
  /** Only read the last `n` values of the set. */
  last?: Maybe<number>
  /** Skip the first `n` values from our `after` cursor, an alternative to cursor based pagination. May not be used with `last`. */
  offset?: Maybe<number>
  /** Read all values in the set before (above) this cursor. */
  before?: Maybe<Cursor>
  /** Read all values in the set after (below) this cursor. */
  after?: Maybe<Cursor>
  /** The method to use when ordering `RouteSegment`. */
  orderBy?: RouteSegmentsOrderBy[]
  /** A condition to be used in determining which values should be returned by the collection. */
  condition?: Maybe<RouteSegmentCondition>
}
export interface AllStopsQueryArgs {
  /** Only read the first `n` values of the set. */
  first?: Maybe<number>
  /** Only read the last `n` values of the set. */
  last?: Maybe<number>
  /** Skip the first `n` values from our `after` cursor, an alternative to cursor based pagination. May not be used with `last`. */
  offset?: Maybe<number>
  /** Read all values in the set before (above) this cursor. */
  before?: Maybe<Cursor>
  /** Read all values in the set after (below) this cursor. */
  after?: Maybe<Cursor>
  /** The method to use when ordering `Stop`. */
  orderBy?: StopsOrderBy[]
  /** A condition to be used in determining which values should be returned by the collection. */
  condition?: Maybe<StopCondition>
}
export interface AllStopAreasQueryArgs {
  /** Only read the first `n` values of the set. */
  first?: Maybe<number>
  /** Only read the last `n` values of the set. */
  last?: Maybe<number>
  /** Skip the first `n` values from our `after` cursor, an alternative to cursor based pagination. May not be used with `last`. */
  offset?: Maybe<number>
  /** Read all values in the set before (above) this cursor. */
  before?: Maybe<Cursor>
  /** Read all values in the set after (below) this cursor. */
  after?: Maybe<Cursor>
  /** The method to use when ordering `StopArea`. */
  orderBy?: StopAreasOrderBy[]
  /** A condition to be used in determining which values should be returned by the collection. */
  condition?: Maybe<StopAreaCondition>
}
export interface AllTerminalsQueryArgs {
  /** Only read the first `n` values of the set. */
  first?: Maybe<number>
  /** Only read the last `n` values of the set. */
  last?: Maybe<number>
  /** Skip the first `n` values from our `after` cursor, an alternative to cursor based pagination. May not be used with `last`. */
  offset?: Maybe<number>
  /** Read all values in the set before (above) this cursor. */
  before?: Maybe<Cursor>
  /** Read all values in the set after (below) this cursor. */
  after?: Maybe<Cursor>
  /** The method to use when ordering `Terminal`. */
  orderBy?: TerminalsOrderBy[]
  /** A condition to be used in determining which values should be returned by the collection. */
  condition?: Maybe<TerminalCondition>
}
export interface DepartureByRouteIdAndDirectionAndDateBeginAndDateEndAndHoursAndMinutesAndStopIdAndDayTypeAndExtraDepartureQueryArgs {
  routeId: string

  direction: string

  dateBegin: Date

  dateEnd: Date

  hours: number

  minutes: number

  stopId: string

  dayType: string

  extraDeparture: string
}
export interface EquipmentByRegistryNrQueryArgs {
  registryNr: string
}
export interface GeometryByRouteIdAndDirectionAndDateBeginAndDateEndQueryArgs {
  routeId: string

  direction: string

  dateBegin: Date

  dateEnd: Date
}
export interface LineByLineIdAndDateBeginAndDateEndQueryArgs {
  lineId: string

  dateBegin: Date

  dateEnd: Date
}
export interface NoteByLineIdAndNoteIdAndNoteTypeQueryArgs {
  lineId: string

  noteId: number

  noteType: string
}
export interface RouteByRouteIdAndDirectionAndDateBeginAndDateEndQueryArgs {
  routeId: string

  direction: string

  dateBegin: Date

  dateEnd: Date
}
export interface RouteSegmentByRouteIdAndDirectionAndDateBeginAndDateEndAndStopIdQueryArgs {
  routeId: string

  direction: string

  dateBegin: Date

  dateEnd: Date

  stopId: string
}
export interface StopByStopIdQueryArgs {
  stopId: string
}
export interface StopAreaByStopAreaIdQueryArgs {
  stopAreaId: string
}
export interface TerminalByTerminalIdQueryArgs {
  terminalId: string
}
export interface StopAreasByBboxQueryArgs {
  minLat?: Maybe<number>

  minLon?: Maybe<number>

  maxLat?: Maybe<number>

  maxLon?: Maybe<number>
  /** Only read the first `n` values of the set. */
  first?: Maybe<number>
  /** Only read the last `n` values of the set. */
  last?: Maybe<number>
  /** Skip the first `n` values from our `after` cursor, an alternative to cursor based pagination. May not be used with `last`. */
  offset?: Maybe<number>
  /** Read all values in the set before (above) this cursor. */
  before?: Maybe<Cursor>
  /** Read all values in the set after (below) this cursor. */
  after?: Maybe<Cursor>
}
export interface StopGroupedByShortIdByBboxQueryArgs {
  minLat?: Maybe<number>

  minLon?: Maybe<number>

  maxLat?: Maybe<number>

  maxLon?: Maybe<number>
  /** Only read the first `n` values of the set. */
  first?: Maybe<number>
  /** Only read the last `n` values of the set. */
  last?: Maybe<number>
  /** Skip the first `n` values from our `after` cursor, an alternative to cursor based pagination. May not be used with `last`. */
  offset?: Maybe<number>
  /** Read all values in the set before (above) this cursor. */
  before?: Maybe<Cursor>
  /** Read all values in the set after (below) this cursor. */
  after?: Maybe<Cursor>
}
export interface StopsByBboxQueryArgs {
  minLat?: Maybe<number>

  minLon?: Maybe<number>

  maxLat?: Maybe<number>

  maxLon?: Maybe<number>
  /** Only read the first `n` values of the set. */
  first?: Maybe<number>
  /** Only read the last `n` values of the set. */
  last?: Maybe<number>
  /** Skip the first `n` values from our `after` cursor, an alternative to cursor based pagination. May not be used with `last`. */
  offset?: Maybe<number>
  /** Read all values in the set before (above) this cursor. */
  before?: Maybe<Cursor>
  /** Read all values in the set after (below) this cursor. */
  after?: Maybe<Cursor>
}
export interface TerminalsByBboxQueryArgs {
  minLat?: Maybe<number>

  minLon?: Maybe<number>

  maxLat?: Maybe<number>

  maxLon?: Maybe<number>
  /** Only read the first `n` values of the set. */
  first?: Maybe<number>
  /** Only read the last `n` values of the set. */
  last?: Maybe<number>
  /** Skip the first `n` values from our `after` cursor, an alternative to cursor based pagination. May not be used with `last`. */
  offset?: Maybe<number>
  /** Read all values in the set before (above) this cursor. */
  before?: Maybe<Cursor>
  /** Read all values in the set after (below) this cursor. */
  after?: Maybe<Cursor>
}
export interface DepartureQueryArgs {
  /** The globally unique `ID` to be used in selecting a single `Departure`. */
  nodeId: string
}
export interface EquipmentQueryArgs {
  /** The globally unique `ID` to be used in selecting a single `Equipment`. */
  nodeId: string
}
export interface GeometryQueryArgs {
  /** The globally unique `ID` to be used in selecting a single `Geometry`. */
  nodeId: string
}
export interface RouteQueryArgs {
  /** The globally unique `ID` to be used in selecting a single `Route`. */
  nodeId: string
}
export interface RouteSegmentQueryArgs {
  /** The globally unique `ID` to be used in selecting a single `RouteSegment`. */
  nodeId: string
}
export interface StopQueryArgs {
  /** The globally unique `ID` to be used in selecting a single `Stop`. */
  nodeId: string
}
export interface StopAreaQueryArgs {
  /** The globally unique `ID` to be used in selecting a single `StopArea`. */
  nodeId: string
}
export interface TerminalQueryArgs {
  /** The globally unique `ID` to be used in selecting a single `Terminal`. */
  nodeId: string
}
export interface RoutesByOriginstopIdStopArgs {
  /** Only read the first `n` values of the set. */
  first?: Maybe<number>
  /** Only read the last `n` values of the set. */
  last?: Maybe<number>
  /** Skip the first `n` values from our `after` cursor, an alternative to cursor based pagination. May not be used with `last`. */
  offset?: Maybe<number>
  /** Read all values in the set before (above) this cursor. */
  before?: Maybe<Cursor>
  /** Read all values in the set after (below) this cursor. */
  after?: Maybe<Cursor>
  /** The method to use when ordering `Route`. */
  orderBy?: RoutesOrderBy[]
  /** A condition to be used in determining which values should be returned by the collection. */
  condition?: Maybe<RouteCondition>
}
export interface RoutesByDestinationstopIdStopArgs {
  /** Only read the first `n` values of the set. */
  first?: Maybe<number>
  /** Only read the last `n` values of the set. */
  last?: Maybe<number>
  /** Skip the first `n` values from our `after` cursor, an alternative to cursor based pagination. May not be used with `last`. */
  offset?: Maybe<number>
  /** Read all values in the set before (above) this cursor. */
  before?: Maybe<Cursor>
  /** Read all values in the set after (below) this cursor. */
  after?: Maybe<Cursor>
  /** The method to use when ordering `Route`. */
  orderBy?: RoutesOrderBy[]
  /** A condition to be used in determining which values should be returned by the collection. */
  condition?: Maybe<RouteCondition>
}
export interface RouteSegmentsByStopIdStopArgs {
  /** Only read the first `n` values of the set. */
  first?: Maybe<number>
  /** Only read the last `n` values of the set. */
  last?: Maybe<number>
  /** Skip the first `n` values from our `after` cursor, an alternative to cursor based pagination. May not be used with `last`. */
  offset?: Maybe<number>
  /** Read all values in the set before (above) this cursor. */
  before?: Maybe<Cursor>
  /** Read all values in the set after (below) this cursor. */
  after?: Maybe<Cursor>
  /** The method to use when ordering `RouteSegment`. */
  orderBy?: RouteSegmentsOrderBy[]
  /** A condition to be used in determining which values should be returned by the collection. */
  condition?: Maybe<RouteSegmentCondition>
}
export interface DeparturesByStopIdStopArgs {
  /** Only read the first `n` values of the set. */
  first?: Maybe<number>
  /** Only read the last `n` values of the set. */
  last?: Maybe<number>
  /** Skip the first `n` values from our `after` cursor, an alternative to cursor based pagination. May not be used with `last`. */
  offset?: Maybe<number>
  /** Read all values in the set before (above) this cursor. */
  before?: Maybe<Cursor>
  /** Read all values in the set after (below) this cursor. */
  after?: Maybe<Cursor>
  /** The method to use when ordering `Departure`. */
  orderBy?: DeparturesOrderBy[]
  /** A condition to be used in determining which values should be returned by the collection. */
  condition?: Maybe<DepartureCondition>
}
export interface DeparturesForDateStopArgs {
  date?: Maybe<Date>

  routeId?: Maybe<string>

  direction?: Maybe<string>
  /** Only read the first `n` values of the set. */
  first?: Maybe<number>
  /** Only read the last `n` values of the set. */
  last?: Maybe<number>
  /** Skip the first `n` values from our `after` cursor, an alternative to cursor based pagination. May not be used with `last`. */
  offset?: Maybe<number>
  /** Read all values in the set before (above) this cursor. */
  before?: Maybe<Cursor>
  /** Read all values in the set after (below) this cursor. */
  after?: Maybe<Cursor>
}
export interface DeparturesGroupedStopArgs {
  date?: Maybe<Date>
  /** Only read the first `n` values of the set. */
  first?: Maybe<number>
  /** Only read the last `n` values of the set. */
  last?: Maybe<number>
  /** Skip the first `n` values from our `after` cursor, an alternative to cursor based pagination. May not be used with `last`. */
  offset?: Maybe<number>
  /** Read all values in the set before (above) this cursor. */
  before?: Maybe<Cursor>
  /** Read all values in the set after (below) this cursor. */
  after?: Maybe<Cursor>
}
export interface ModesStopArgs {
  date?: Maybe<Date>
  /** Only read the first `n` values of the set. */
  first?: Maybe<number>
  /** Only read the last `n` values of the set. */
  last?: Maybe<number>
  /** Skip the first `n` values from our `after` cursor, an alternative to cursor based pagination. May not be used with `last`. */
  offset?: Maybe<number>
  /** Read all values in the set before (above) this cursor. */
  before?: Maybe<Cursor>
  /** Read all values in the set after (below) this cursor. */
  after?: Maybe<Cursor>
}
export interface RouteSegmentsForDateStopArgs {
  date?: Maybe<Date>
  /** Only read the first `n` values of the set. */
  first?: Maybe<number>
  /** Only read the last `n` values of the set. */
  last?: Maybe<number>
  /** Skip the first `n` values from our `after` cursor, an alternative to cursor based pagination. May not be used with `last`. */
  offset?: Maybe<number>
  /** Read all values in the set before (above) this cursor. */
  before?: Maybe<Cursor>
  /** Read all values in the set after (below) this cursor. */
  after?: Maybe<Cursor>
}
export interface SiblingsStopArgs {
  /** Only read the first `n` values of the set. */
  first?: Maybe<number>
  /** Only read the last `n` values of the set. */
  last?: Maybe<number>
  /** Skip the first `n` values from our `after` cursor, an alternative to cursor based pagination. May not be used with `last`. */
  offset?: Maybe<number>
  /** Read all values in the set before (above) this cursor. */
  before?: Maybe<Cursor>
  /** Read all values in the set after (below) this cursor. */
  after?: Maybe<Cursor>
}
export interface StopsByTerminalIdTerminalArgs {
  /** Only read the first `n` values of the set. */
  first?: Maybe<number>
  /** Only read the last `n` values of the set. */
  last?: Maybe<number>
  /** Skip the first `n` values from our `after` cursor, an alternative to cursor based pagination. May not be used with `last`. */
  offset?: Maybe<number>
  /** Read all values in the set before (above) this cursor. */
  before?: Maybe<Cursor>
  /** Read all values in the set after (below) this cursor. */
  after?: Maybe<Cursor>
  /** The method to use when ordering `Stop`. */
  orderBy?: StopsOrderBy[]
  /** A condition to be used in determining which values should be returned by the collection. */
  condition?: Maybe<StopCondition>
}
export interface ModesTerminalArgs {
  date?: Maybe<Date>
  /** Only read the first `n` values of the set. */
  first?: Maybe<number>
  /** Only read the last `n` values of the set. */
  last?: Maybe<number>
  /** Skip the first `n` values from our `after` cursor, an alternative to cursor based pagination. May not be used with `last`. */
  offset?: Maybe<number>
  /** Read all values in the set before (above) this cursor. */
  before?: Maybe<Cursor>
  /** Read all values in the set after (below) this cursor. */
  after?: Maybe<Cursor>
}
export interface StopsByStopAreaIdStopAreaArgs {
  /** Only read the first `n` values of the set. */
  first?: Maybe<number>
  /** Only read the last `n` values of the set. */
  last?: Maybe<number>
  /** Skip the first `n` values from our `after` cursor, an alternative to cursor based pagination. May not be used with `last`. */
  offset?: Maybe<number>
  /** Read all values in the set before (above) this cursor. */
  before?: Maybe<Cursor>
  /** Read all values in the set after (below) this cursor. */
  after?: Maybe<Cursor>
  /** The method to use when ordering `Stop`. */
  orderBy?: StopsOrderBy[]
  /** A condition to be used in determining which values should be returned by the collection. */
  condition?: Maybe<StopCondition>
}
export interface DepartureNotesRouteArgs {
  date?: Maybe<Date>
}
export interface DeparturesRouteArgs {
  /** Only read the first `n` values of the set. */
  first?: Maybe<number>
  /** Only read the last `n` values of the set. */
  last?: Maybe<number>
  /** Skip the first `n` values from our `after` cursor, an alternative to cursor based pagination. May not be used with `last`. */
  offset?: Maybe<number>
  /** Read all values in the set before (above) this cursor. */
  before?: Maybe<Cursor>
  /** Read all values in the set after (below) this cursor. */
  after?: Maybe<Cursor>
}
export interface DeparturesGroupedRouteArgs {
  date?: Maybe<Date>
  /** Only read the first `n` values of the set. */
  first?: Maybe<number>
  /** Only read the last `n` values of the set. */
  last?: Maybe<number>
  /** Skip the first `n` values from our `after` cursor, an alternative to cursor based pagination. May not be used with `last`. */
  offset?: Maybe<number>
  /** Read all values in the set before (above) this cursor. */
  before?: Maybe<Cursor>
  /** Read all values in the set after (below) this cursor. */
  after?: Maybe<Cursor>
}
export interface GeometriesRouteArgs {
  date?: Maybe<Date>
  /** Only read the first `n` values of the set. */
  first?: Maybe<number>
  /** Only read the last `n` values of the set. */
  last?: Maybe<number>
  /** Skip the first `n` values from our `after` cursor, an alternative to cursor based pagination. May not be used with `last`. */
  offset?: Maybe<number>
  /** Read all values in the set before (above) this cursor. */
  before?: Maybe<Cursor>
  /** Read all values in the set after (below) this cursor. */
  after?: Maybe<Cursor>
}
export interface HasRegularDayDeparturesRouteArgs {
  date?: Maybe<Date>
}
export interface LineRouteArgs {
  /** Only read the first `n` values of the set. */
  first?: Maybe<number>
  /** Only read the last `n` values of the set. */
  last?: Maybe<number>
  /** Skip the first `n` values from our `after` cursor, an alternative to cursor based pagination. May not be used with `last`. */
  offset?: Maybe<number>
  /** Read all values in the set before (above) this cursor. */
  before?: Maybe<Cursor>
  /** Read all values in the set after (below) this cursor. */
  after?: Maybe<Cursor>
}
export interface RouteSegmentsRouteArgs {
  /** Only read the first `n` values of the set. */
  first?: Maybe<number>
  /** Only read the last `n` values of the set. */
  last?: Maybe<number>
  /** Skip the first `n` values from our `after` cursor, an alternative to cursor based pagination. May not be used with `last`. */
  offset?: Maybe<number>
  /** Read all values in the set before (above) this cursor. */
  before?: Maybe<Cursor>
  /** Read all values in the set after (below) this cursor. */
  after?: Maybe<Cursor>
}
export interface NotesLineArgs {
  date?: Maybe<Date>
  /** Only read the first `n` values of the set. */
  first?: Maybe<number>
  /** Only read the last `n` values of the set. */
  last?: Maybe<number>
  /** Skip the first `n` values from our `after` cursor, an alternative to cursor based pagination. May not be used with `last`. */
  offset?: Maybe<number>
  /** Read all values in the set before (above) this cursor. */
  before?: Maybe<Cursor>
  /** Read all values in the set after (below) this cursor. */
  after?: Maybe<Cursor>
}
export interface RoutesLineArgs {
  /** Only read the first `n` values of the set. */
  first?: Maybe<number>
  /** Only read the last `n` values of the set. */
  last?: Maybe<number>
  /** Skip the first `n` values from our `after` cursor, an alternative to cursor based pagination. May not be used with `last`. */
  offset?: Maybe<number>
  /** Read all values in the set before (above) this cursor. */
  before?: Maybe<Cursor>
  /** Read all values in the set after (below) this cursor. */
  after?: Maybe<Cursor>
}
export interface DepartureNotesRouteSegmentArgs {
  date?: Maybe<Date>
}
export interface DeparturesGroupedRouteSegmentArgs {
  date?: Maybe<Date>
  /** Only read the first `n` values of the set. */
  first?: Maybe<number>
  /** Only read the last `n` values of the set. */
  last?: Maybe<number>
  /** Skip the first `n` values from our `after` cursor, an alternative to cursor based pagination. May not be used with `last`. */
  offset?: Maybe<number>
  /** Read all values in the set before (above) this cursor. */
  before?: Maybe<Cursor>
  /** Read all values in the set after (below) this cursor. */
  after?: Maybe<Cursor>
}
export interface HasRegularDayDeparturesRouteSegmentArgs {
  date?: Maybe<Date>
}
export interface LineRouteSegmentArgs {
  /** Only read the first `n` values of the set. */
  first?: Maybe<number>
  /** Only read the last `n` values of the set. */
  last?: Maybe<number>
  /** Skip the first `n` values from our `after` cursor, an alternative to cursor based pagination. May not be used with `last`. */
  offset?: Maybe<number>
  /** Read all values in the set before (above) this cursor. */
  before?: Maybe<Cursor>
  /** Read all values in the set after (below) this cursor. */
  after?: Maybe<Cursor>
}
export interface NextStopsRouteSegmentArgs {
  /** Only read the first `n` values of the set. */
  first?: Maybe<number>
  /** Only read the last `n` values of the set. */
  last?: Maybe<number>
  /** Skip the first `n` values from our `after` cursor, an alternative to cursor based pagination. May not be used with `last`. */
  offset?: Maybe<number>
  /** Read all values in the set before (above) this cursor. */
  before?: Maybe<Cursor>
  /** Read all values in the set after (below) this cursor. */
  after?: Maybe<Cursor>
}
export interface NotesRouteSegmentArgs {
  date?: Maybe<Date>
  /** Only read the first `n` values of the set. */
  first?: Maybe<number>
  /** Only read the last `n` values of the set. */
  last?: Maybe<number>
  /** Skip the first `n` values from our `after` cursor, an alternative to cursor based pagination. May not be used with `last`. */
  offset?: Maybe<number>
  /** Read all values in the set before (above) this cursor. */
  before?: Maybe<Cursor>
  /** Read all values in the set after (below) this cursor. */
  after?: Maybe<Cursor>
}
export interface RouteRouteSegmentArgs {
  date?: Maybe<Date>
  /** Only read the first `n` values of the set. */
  first?: Maybe<number>
  /** Only read the last `n` values of the set. */
  last?: Maybe<number>
  /** Skip the first `n` values from our `after` cursor, an alternative to cursor based pagination. May not be used with `last`. */
  offset?: Maybe<number>
  /** Read all values in the set before (above) this cursor. */
  before?: Maybe<Cursor>
  /** Read all values in the set after (below) this cursor. */
  after?: Maybe<Cursor>
}
export interface StopsStopGroupedArgs {
  /** Only read the first `n` values of the set. */
  first?: Maybe<number>
  /** Only read the last `n` values of the set. */
  last?: Maybe<number>
  /** Skip the first `n` values from our `after` cursor, an alternative to cursor based pagination. May not be used with `last`. */
  offset?: Maybe<number>
  /** Read all values in the set before (above) this cursor. */
  before?: Maybe<Cursor>
  /** Read all values in the set after (below) this cursor. */
  after?: Maybe<Cursor>
}
