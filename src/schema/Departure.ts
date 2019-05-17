import { gql } from 'apollo-server'

export const Departure = gql`
  type PlannedDeparture {
    id: ID!
    departureDate: Date!
    departureTime: Time!
    departureDateTime: DateTime!
    isNextDay: Boolean
  }

  type ObservedDeparture {
    id: ID!
    departureEvent: JourneyEvent!
    departureDate: Date!
    departureTime: Time!
    departureDateTime: DateTime!
    departureTimeDifference: Int!
  }

  type PlannedArrival {
    id: ID!
    arrivalDate: Date!
    arrivalTime: Time!
    arrivalDateTime: DateTime!
    isNextDay: Boolean
  }

  type ObservedArrival {
    id: ID!
    arrivalEvent: JourneyEvent!
    arrivalDate: Date!
    arrivalTime: Time!
    arrivalDateTime: DateTime!
    arrivalTimeDifference: Int!
    doorDidOpen: Boolean!
  }

  type DepartureJourney {
    id: ID!
    lineId: String
    routeId: String!
    direction: Direction!
    originStopId: String
    departureDate: Date!
    departureTime: Time!
    uniqueVehicleId: VehicleId
    mode: String
    events: [JourneyEvent!]
    alerts: [Alert!]!
    cancellations: [Cancellation!]!
    isCancelled: Boolean!
    _numInstance: Int
  }

  type Departure {
    id: ID!
    stopId: String!
    dayType: String!
    equipmentType: String
    equipmentIsRequired: Boolean
    equipmentColor: String
    operatorId: String
    routeId: String!
    direction: Direction!
    terminalTime: Int
    recoveryTime: Int
    departureId: Int!
    extraDeparture: String!
    isNextDay: Boolean!
    isTimingStop: Boolean!
    index: Int
    mode: String!
    stop: RouteSegment!
    journey: DepartureJourney
    alerts: [Alert!]!
    cancellations: [Cancellation!]!
    isCancelled: Boolean!
    originDepartureTime: PlannedDeparture
    plannedArrivalTime: PlannedArrival!
    observedArrivalTime: ObservedArrival
    plannedDepartureTime: PlannedDeparture!
    observedDepartureTime: ObservedDeparture
  }

  input DepartureFilterInput {
    routeId: String
    direction: Direction
    minHour: Int
    maxHour: Int
  }
`
