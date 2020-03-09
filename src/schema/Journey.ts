import { gql } from 'apollo-server'

/*
  Journey.id = routeId_direction_departureDate_departureTime
 */

export const Journey = gql`
  enum TlpRequestType {
    NORMAL
    DOOR_CLOSE
    DOOR_OPEN
    ADVANCE
  }
  enum TlpPriorityLevel {
    NORMAL
    HIGH
    NOREQUEST
  }
  enum TlpReason {
    GLOBAL
    AHEAD
    LINE
    PRIOEXEP
  }
  enum TlpDecision {
    ACK
    NAK
  }
  enum TlpType {
    TLR
    TLA
  }
  type JourneyEvent {
    id: ID!
    type: String!
    receivedAt: DateTime!
    recordedAt: DateTime!
    recordedAtUnix: Int!
    recordedTime: Time!
    stopId: String
    lat: Float
    lng: Float
    loc: String
    _isVirtual: Boolean
    _sort: Int
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
    _sort: Int
  }

  type JourneyStopEvent {
    id: ID!
    type: String!
    receivedAt: DateTime!
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
    plannedUnix: Int
    plannedTimeDifference: Int
    isNextDay: Boolean
    departureId: Int
    isTimingStop: Boolean!
    isOrigin: Boolean
    index: Int!
    stop: Stop
    lat: Float
    lng: Float
    loc: String
    unplannedStop: Boolean!
    _isVirtual: Boolean
    _sort: Int
  }
  type PlannedStopEvent {
    id: ID!
    type: String!
    stopId: String
    plannedDate: Date
    plannedTime: Time
    plannedDateTime: DateTime
    plannedUnix: Int
    isNextDay: Boolean
    departureId: Int
    isTimingStop: Boolean!
    isOrigin: Boolean
    index: Int!
    stop: Stop
    _sort: Int
  }
  type JourneyTlpEvent {
    id: ID!
    type: String!
    requestId: Int
    requestType: TlpRequestType
    priorityLevel: TlpPriorityLevel
    reason: TlpReason
    attemptSeq: Int
    decision: TlpDecision
    junctionId: Int
    signalGroupId: Int
    signalGroupNbr: Int
    lineConfigId: Int
    pointConfigId: Int
    frequency: Int
    protocol: String
    receivedAt: DateTime!
    recordedAt: DateTime!
    recordedAtUnix: Int!
    recordedTime: Time!
    nextStopId: String
    lat: Float
    lng: Float
    loc: String
    _sort: Int
  }
  union JourneyEventType =
      JourneyEvent
    | JourneyStopEvent
    | JourneyCancellationEvent
    | PlannedStopEvent
    | JourneyTlpEvent

  type VehiclePosition implements Position {
    id: ID!
    journeyType: String!
    receivedAt: DateTime!
    recordedAt: DateTime!
    recordedAtUnix: Int!
    recordedTime: Time!
    stop: String
    nextStopId: String
    uniqueVehicleId: VehicleId
    operatorId: String
    vehicleId: String
    lat: Float
    lng: Float
    loc: String
    velocity: Float
    doorStatus: Boolean
    delay: Int
    heading: Int
    mode: String
    _sort: Int
  }

  type Journey {
    id: ID!
    journeyType: String!
    routeId: String
    direction: Direction
    originStopId: String
    departureDate: Date!
    departureTime: Time
    uniqueVehicleId: VehicleId
    operatorId: String
    vehicleId: String
    headsign: String
    name: String
    mode: String
    journeyLength: Int
    journeyDurationMinutes: Int
    equipment: Equipment
    vehiclePositions: [VehiclePosition!]!
    events: [JourneyEventType!]!
    departure: Departure
    routeDepartures: [Departure!]
    alerts: [Alert!]!
    cancellations: [Cancellation!]!
    isCancelled: Boolean!
  }

  type VehicleJourney {
    id: ID!
    journeyType: String!
    routeId: String
    direction: Direction
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
    loc: String
    alerts: [Alert!]!
    cancellations: [Cancellation!]!
    isCancelled: Boolean!
  }

  input AreaEventsFilterInput {
    routeId: String
    direction: Direction
  }
`
