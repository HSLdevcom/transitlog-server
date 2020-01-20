import { gql } from 'apollo-server'

export const DriverEvent = gql`
  type DriverEvent {
    id: ID!
    journeyType: String!
    eventType: String!
    uniqueVehicleId: VehicleId
    operatorId: String
    vehicleId: String
    mode: String
    recordedAt: DateTime!
    recordedAtUnix: Int!
    recordedTime: Time!
    receivedAt: DateTime
    lat: Float
    lng: Float
    loc: String
  }
`
