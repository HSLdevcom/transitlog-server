import { gql } from 'apollo-server'

/*
  Journey.id = routeId_direction_departureDate_departureTime
 */

export const Journey = gql`
  type JourneyEvent {
    id: ID!
    type: String!
    recordedAt: DateTime!
    recordedAtUnix: Int!
    recordedTime: Time!
    stopId: String
  }

  type JourneyCancellationEvent {
    id: ID!
    type: String!
    recordedAt: DateTime!
    recordedAtUnix: Int!
    recordedTime: Time!
    plannedDate: Date
    plannedTime: Time
    title: String!
    description: String!
    category: AlertCategory!
    subCategory: CancellationSubcategory!
    isCancelled: Boolean!
    cancellationType: CancellationType!
    cancellationEffect: CancellationEffect!
  }

  type JourneyStopEvent {
    id: ID!
    type: String!
    recordedAt: DateTime!
    recordedAtUnix: Int!
    recordedTime: Time!
    nextStopId: String!
    stopId: String
    doorsOpened: Boolean
    stopped: Boolean
    plannedDate: Date
    plannedTime: Time
    plannedDateTime: DateTime
    plannedTimeDifference: Int
    isNextDay: Boolean
    departureId: Int
    isTimingStop: Boolean!
    isOrigin: Boolean
    index: Int
    stop: Stop
    unplannedStop: Boolean!
  }

  type PlannedStopEvent {
    id: ID!
    type: String!
    stopId: String
    plannedDate: Date
    plannedTime: Time
    plannedDateTime: DateTime
    isNextDay: Boolean
    departureId: Int
    isTimingStop: Boolean!
    isOrigin: Boolean
    index: Int
    stop: Stop
  }

  union JourneyEventType =
      JourneyEvent
    | JourneyStopEvent
    | JourneyCancellationEvent
    | PlannedStopEvent

  type VehiclePosition implements Position {
    id: ID!
    journeyType: String!
    recordedAt: DateTime!
    recordedAtUnix: Int!
    recordedTime: Time!
    stop: String
    nextStopId: String
    lat: Float
    lng: Float
    velocity: Float
    doorStatus: Boolean
    delay: Int
    heading: Int
  }

  type Journey {
    id: ID!
    journeyType: String!
    lineId: String
    routeId: String
    direction: Direction
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
    vehiclePositions: [VehiclePosition!]!
    events: [JourneyEventType!]!
    departure: Departure
    alerts: [Alert!]!
    cancellations: [Cancellation!]!
    isCancelled: Boolean!
  }

  type VehicleJourney {
    id: ID!
    journeyType: String!
    lineId: String
    routeId: String
    direction: Direction
    originStopId: String
    departureDate: Date!
    departureTime: Time!
    uniqueVehicleId: VehicleId
    operatorId: String
    vehicleId: String
    headsign: String
    mode: String
    recordedAt: DateTime!
    recordedAtUnix: Int!
    recordedTime: Time!
    timeDifference: Int!
    nextStopId: String
    alerts: [Alert!]!
    cancellations: [Cancellation!]!
    isCancelled: Boolean!
  }

  type AreaJourney {
    id: ID!
    journeyType: String!
    lineId: String
    routeId: String
    direction: Direction
    departureDate: Date!
    departureTime: Time!
    uniqueVehicleId: VehicleId
    operatorId: String
    vehicleId: String
    headsign: String
    mode: String
    vehiclePositions: [VehiclePosition]!
    alerts: [Alert!]!
    cancellations: [Cancellation!]!
    isCancelled: Boolean!
  }

  input AreaEventsFilterInput {
    routeId: String
    direction: Direction
  }
`
