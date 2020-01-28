import { gql } from 'apollo-server'

export const Schema = gql`
  scalar Date
  scalar Time
  scalar DateTime
  scalar VehicleId
  scalar BBox
  scalar PreciseBBox
  scalar Direction

  """
  Any object that describes something with a position implements this interface.
  """
  interface Position {
    lat: Float
    lng: Float
  }

  schema {
    query: Query
  }

  type UIMessage {
    date: String
    message: String
  }

  type Query {
    equipment(filter: EquipmentFilterInput, date: Date): [Equipment]!
    stop(stopId: String!, date: Date!): Stop
    stops(date: Date, filter: StopFilterInput): [Stop]!
    route(routeId: String!, direction: Direction!, date: Date!): Route
    routes(filter: RouteFilterInput, date: Date): [Route]!
    routeGeometry(routeId: String!, direction: Direction!, date: Date!): RouteGeometry
    routeSegments(routeId: String!, direction: Direction!, date: Date!): [RouteSegment]!
    departures(filter: DepartureFilterInput, stopId: String!, date: Date!): [Departure]!
    routeDepartures(
      stopId: String!
      routeId: String!
      direction: Direction!
      date: Date!
    ): [Departure]!
    weeklyDepartures(
      stopId: String!
      routeId: String!
      direction: Direction!
      date: Date!
      lastStopArrival: Boolean
    ): [Departure]!
    exceptionDays(year: String!): [ExceptionDay]!
    journey(
      routeId: String!
      direction: Direction!
      departureTime: Time!
      departureDate: Date!
      uniqueVehicleId: VehicleId
      unsignedEvents: Boolean
    ): Journey
    journeys(routeId: String!, direction: Direction!, departureDate: Date!): [Journey]!
    vehicleJourneys(
      uniqueVehicleId: VehicleId!
      date: Date!
      unsignedEvents: Boolean
    ): [VehicleJourney]!
    driverEvents(uniqueVehicleId: VehicleId!, date: Date!): [DriverEvent]!
    journeysByBbox(
      minTime: DateTime!
      maxTime: DateTime!
      bbox: PreciseBBox!
      date: Date!
      filters: AreaEventsFilterInput
      unsignedEvents: Boolean
    ): [Journey]!
    unsignedVehicleEvents(uniqueVehicleId: VehicleId!, date: Date!): [VehiclePosition]!
    alerts(time: String, language: String!, alertSearch: AlertSearchInput): [Alert!]!
    cancellations(date: Date, cancellationSearch: CancellationSearchInput): [Cancellation!]!
    tlpEvents(date: Date, tlpEventSearch: TlpEventSearchInput): [TlpEvent!]!
    uiMessage: UIMessage!
  }
`
