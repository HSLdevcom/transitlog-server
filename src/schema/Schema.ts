import { gql } from 'apollo-server'

export const Schema = gql`
  """
  A Date string in YYYY-MM-DD format. The timezone is set on the server with environment variables.
  """
  scalar Date

  """
  A time string in HH:mm:ss format. Since we are dealing with 24h+ times, the time is not a clock time, but a duration of seconds from 00:00:00. Thus the hour component can go beyond 23.
  """
  scalar Time

  """
  A datetime string in ISO 8601 format YYYY-MM-DDTHH:mm:ssZ. If received with a timezone, the timezone will be converted to the server timezone. In response data the timezone will always be set to the server timezone.
  """
  scalar DateTime

  """
  A string that uniquely identifies a vehicle. The format is [operator ID]/[vehicle ID]. The operator ID is padded to have a length of 4 characters.
  """
  scalar VehicleId

  """
  A string that defines a bounding box. The coordinates should be in the format \`minLng,maxLat,maxLng,minLat\` which is compatible with what Leaflet's LatLngBounds.toBBoxString() returns.
  """
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
      includeLinesWithoutRoutes: Boolean
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
