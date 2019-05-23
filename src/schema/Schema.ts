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

  type Query {
    equipment(filter: EquipmentFilterInput, date: Date): [Equipment]!
    stop(stopId: String!, date: Date!): Stop
    stops(filter: StopFilterInput): [SimpleStop]!
    stopsByBbox(filter: StopFilterInput, bbox: PreciseBBox!): [SimpleStop]!
    route(routeId: String!, direction: Direction!, date: Date!): Route
    routes(filter: RouteFilterInput, line: String, date: Date): [Route]!
    routeGeometry(routeId: String!, direction: Direction!, date: Date!): RouteGeometry
    routeSegments(routeId: String!, direction: Direction!, date: Date!): [RouteSegment]!
    lines(filter: LineFilterInput, date: Date, includeLinesWithoutRoutes: Boolean = false): [Line]!
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
    ): [Departure]!
    exceptionDays(year: String!): [ExceptionDay]!
    journey(
      routeId: String!
      direction: Direction!
      departureTime: Time!
      departureDate: Date!
      uniqueVehicleId: VehicleId
    ): Journey
    journeys(routeId: String!, direction: Direction!, departureDate: Date!): [Journey]!
    vehicleJourneys(uniqueVehicleId: VehicleId!, date: Date!): [VehicleJourney]!
    eventsByBbox(
      minTime: DateTime!
      maxTime: DateTime!
      bbox: PreciseBBox!
      date: Date!
      filters: AreaEventsFilterInput
    ): [AreaJourney]!
    alerts(time: String, alertSearch: AlertSearchInput): [Alert!]!
    cancellations(date: Date, cancellationSearch: CancellationSearchInput): [Cancellation!]!
  }
`
