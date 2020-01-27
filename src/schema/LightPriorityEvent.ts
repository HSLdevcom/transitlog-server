import { gql } from 'apollo-server'

export const LightPriorityEvent = gql`
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

  type LightPriorityEvent {
    requestId: Int
    requestType: TlpRequestType
    priorityLevel: TlpPriorityLevel
    reason: TlpReason
    attemptSeq: Int
    decision: TlpDecision
    junctionId: Int
    signalGroupId: Int
    signalGroupNum: Int
    lineConfigId: Int
    pointConfigId: Int
    frequency: Int
    protocol: String
    recordedAt: DateTime
    recordedTime: Time
    lat: Float
    lng: Float
    loc: String
  }

  input LightPriorityEventSearchInput {
    all: Boolean
    sid: Int
    junctionId: Int
    signalGroupid: Int
  }
`
