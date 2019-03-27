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
    stops(filter: StopFilterInput): [Stop]!
    stopsByBbox(filter: StopFilterInput, bbox: BBox!): [Stop]!
    route(routeId: String!, direction: Direction!, date: Date!): Route
    routes(filter: RouteFilterInput, line: String, date: Date): [Route]!
    routeGeometry(routeId: String!, direction: Direction!, date: Date!): RouteGeometry
    routeSegments(routeId: String!, direction: Direction!, date: Date!): [RouteSegment]!
    lines(filter: LineFilterInput, date: Date, includeLinesWithoutRoutes: Boolean = false): [Line]!
    departures(filter: DepartureFilterInput, stopId: String!, date: Date!): [Departure]!
    journey(
      routeId: String!
      direction: Direction!
      departureTime: Time!
      departureDate: Date!
      uniqueVehicleId: VehicleId!
    ): Journey
    vehicleJourneys(uniqueVehicleId: VehicleId!, date: Date!): [VehicleJourney]!
    eventsByBbox(
      minTime: DateTime!
      maxTime: DateTime!
      bbox: PreciseBBox!
      date: Date!
      filters: AreaEventsFilterInput
    ): [AreaJourney]!
  }
`
