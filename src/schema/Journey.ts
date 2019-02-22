import { gql } from 'apollo-server'

/*
  Journey.id = routeId_direction_departureDate_departureTime
 */

export const Journey = gql`
  type JourneyEvent implements Position {
    receivedAt: DateTime!
    recordedAt: DateTime!
    recordedAtUnix: Int!
    recordedTime: Time!
    nextStopId: String
    lat: Float!
    lng: Float!
    doorStatus: Boolean
    velocity: Float
    delay: Int
    heading: Int
  }

  type Journey {
    id: ID!
    routeId: String!
    direction: Direction!
    departureDate: Date!
    departureTime: Time!
    uniqueVehicleId: VehicleId
    operatorId: String
    vehicleId: String
    instance: Int
    headsign: String
    equipment: Equipment!
    events: [JourneyEvent]!
    departures: [Departure]!
  }
`
