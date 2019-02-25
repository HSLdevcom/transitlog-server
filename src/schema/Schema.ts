import { gql } from 'apollo-server'

export const Schema = gql`
  scalar Date
  scalar Time
  scalar DateTime
  scalar VehicleId
  scalar BBox

  enum Direction {
    D1
    D2
  }

  """
  Any object that describes something with a position implements this interface.
  """
  interface Position {
    lat: Float!
    lng: Float!
  }

  schema {
    query: Query
  }

  type Query {
    equipment(filter: EquipmentFilterInput, date: Date): [Equipment]!
    stops(filter: StopFilterInput): [Stop]!
    routes(filter: RouteFilterInput, date: Date): [Route]!
    routeGeometry(routeId: String!, direction: Direction!, date: Date!): RouteGeometry
    lines(
      filter: LineFilterInput
      date: Date
      includeLinesWithoutRoutes: Boolean = false
    ): [Line]!
    departures(filter: DepartureFilterInput, stopId: String, date: Date!): [Departure]!
    journey(
      routeId: String!
      direction: Direction!
      departureTime: Time!
      departureDate: Date!
    ): Journey
  }
`
