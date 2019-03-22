import { gql } from 'apollo-server'

export const Departure = gql`
  type PlannedDeparture {
    departureDate: Date!
    departureTime: Time!
    departureDateTime: DateTime!
    isNextDay: Boolean
  }

  type ObservedDeparture {
    departureEvent: JourneyEvent!
    departureDate: Date!
    departureTime: Time!
    departureDateTime: DateTime!
    departureTimeDifference: Int!
  }

  type PlannedArrival {
    arrivalDate: Date!
    arrivalTime: Time!
    arrivalDateTime: DateTime!
    isNextDay: Boolean
  }

  type ObservedArrival {
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
    instance: Int
    _multipleInstances: Boolean
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
    departureId: Int
    extraDeparture: String
    isNextDay: Boolean
    isTimingStop: Boolean
    index: Int
    stop: RouteSegment
    journey: DepartureJourney
    plannedArrivalTime: PlannedArrival
    observedArrivalTime: ObservedArrival
    plannedDepartureTime: PlannedDeparture
    observedDepartureTime: ObservedDeparture
  }

  input DepartureFilterInput {
    routeId: String
    direction: Direction
    minHour: Int
    maxHour: Int
  }
`
