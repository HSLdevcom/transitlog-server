import { gql } from 'apollo-server'

export const Schema = gql`
  scalar Upload
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
    mutation: Mutation
  }

  type UIMessage {
    date: String
    message: String
  }

  type Query {
    uploads: [File]
    equipment(filter: EquipmentFilterInput, date: Date): [Equipment]!
    stop(stopId: String!, date: Date!): Stop
    stops(date: Date!, filter: StopFilterInput): [Stop]!
    routeStops(routeId: String!, direction: Direction!, date: Date!): [Stop]!
    terminals(date: Date): [Terminal]!
    terminal(terminalId: String, date: Date): Terminal
    route(routeId: String!, direction: Direction!, date: Date!): Route
    routes(filter: RouteFilterInput, date: Date): [Route]!
    routeGeometry(routeId: String!, direction: Direction!, date: Date!): RouteGeometry
    routeSegments(routeId: String!, direction: Direction!, date: Date!): [RouteSegment]!
    departures(
      stopId: String
      terminalId: String
      filter: DepartureFilterInput
      date: Date!
    ): [Departure]!
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
    uiMessage: UIMessage!
  }

  type File {
    filename: String!
    mimetype: String!
    encoding: String!
  }

  type Feedback {
    text: String!
    email: String!
    msgTs: String!
  }

  type Mutation {
    sendFeedback(text: String!, email: String!, url: String!): Feedback!
    uploadFeedbackImage(file: Upload!, msgTs: String): File!
  }
`
