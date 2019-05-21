import { gql } from 'apollo-server'

/*
  Journey.id = routeId_direction_departureDate_departureTime
 */

export const Journey = gql`
  type JourneyEvent implements Position {
    id: ID!
    receivedAt: DateTime!
    recordedAt: DateTime!
    recordedAtUnix: Int!
    recordedTime: Time!
    nextStopId: String
    lat: Float
    lng: Float
    doorStatus: Boolean
    velocity: Float
    delay: Int
    heading: Int
  }

  type Journey {
    id: ID!
    lineId: String
    routeId: String!
    direction: Direction!
    originStopId: String
    departureDate: Date!
    departureTime: Time!
    uniqueVehicleId: VehicleId
    operatorId: String
    vehicleId: String
    headsign: String
    name: String
    mode: String
    equipment: Equipment
    events: [JourneyEvent!]!
    departures: [Departure!]!
    alerts: [Alert!]!
    cancellations: [Cancellation!]!
    isCancelled: Boolean!
  }

  type VehicleJourney {
    id: ID!
    lineId: String
    routeId: String!
    direction: Direction!
    originStopId: String
    departureDate: Date!
    departureTime: Time!
    uniqueVehicleId: VehicleId
    operatorId: String
    vehicleId: String
    headsign: String
    mode: String
    receivedAt: DateTime!
    recordedAt: DateTime!
    recordedAtUnix: Int!
    recordedTime: Time!
    timeDifference: Int!
    nextStopId: String!
    alerts: [Alert!]!
    cancellations: [Cancellation!]!
    isCancelled: Boolean!
  }

  type AreaJourney {
    id: ID!
    lineId: String
    routeId: String!
    direction: Direction!
    departureDate: Date!
    departureTime: Time!
    uniqueVehicleId: VehicleId
    operatorId: String
    vehicleId: String
    headsign: String
    mode: String
    events: [JourneyEvent]!
    alerts: [Alert!]!
    cancellations: [Cancellation!]!
    isCancelled: Boolean!
  }

  input AreaEventsFilterInput {
    routeId: String
    direction: Direction
  }
`
