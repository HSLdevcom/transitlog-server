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
    arrivalDate: Date!
    arrivalTime: Time!
    arrivalDateTime: DateTime!
    arrivalTimeDifference: Int!
  }

  type DepartureJourney {
    id: ID!
    type: String!
    lineId: String
    routeId: String!
    direction: Direction!
    originStopId: String
    departureDate: Date!
    departureTime: Time!
    uniqueVehicleId: VehicleId
    mode: String
    events: [VehiclePosition!]
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
    departureTime: Time!
    departureDate: Date!
    extraDeparture: String!
    isNextDay: Boolean!
    isTimingStop: Boolean!
    index: Int
    mode: String!
    stop: Stop!
    journey: DepartureJourney
    alerts: [Alert!]!
    cancellations: [Cancellation!]!
    isCancelled: Boolean!
    isOrigin: Boolean
    departureEvent: JourneyStopEvent
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
