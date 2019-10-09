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
    stopsByBbox(filter: StopFilterInput, bbox: PreciseBBox!, date: Date!): [Stop]!
    route(routeId: String!, direction: Direction!, date: Date!): Route
    routes(filter: RouteFilterInput, line: String, date: Date): [Route]!
    routeGeometry(routeId: String!, direction: Direction!, date: Date!): RouteGeometry
    routeSegments(routeId: String!, direction: Direction!, date: Date!): [RouteSegment]!
    lines(
      filter: LineFilterInput
      date: Date
      includeLinesWithoutRoutes: Boolean = false
    ): [Line]!
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
    unsignedVehicleEvents(uniqueVehicleId: VehicleId!, date: Date!): [VehiclePosition]!
    eventsByBbox(
      minTime: DateTime!
      maxTime: DateTime!
      bbox: PreciseBBox!
      date: Date!
      filters: AreaEventsFilterInput
      unsignedEvents: Boolean
    ): [AreaJourney]!
    alerts(time: String, language: String!, alertSearch: AlertSearchInput): [Alert!]!
    cancellations(date: Date, cancellationSearch: CancellationSearchInput): [Cancellation!]!
    uiMessage: UIMessage!
  }
`
