import { gql } from 'apollo-server'

export const Alerts = gql`
  enum AlertDistribution {
    STOP
    ALL_STOPS
    ROUTE
    ALL_ROUTES
    NETWORK
  }

  enum AlertLevel {
    INFO
    WARNING
    SEVERE
  }

  enum AlertCategory {
    VEHICLE_BREAKDOWN
    ACCIDENT
    NO_DRIVER
    ASSAULT
    WEATHER
    VEHICLE_OFF_THE_ROAD
    SEIZURE
    ITS_SYSTEM_ERROR
    OTHER_DRIVER_ERROR
    TOO_MANY_PASSENGERS
    STRIKE
    OTHER
    EARLIER_DISRUPTION
    NO_TRAFFIC_DISRUPTION
    TRACK_BLOCKED
    STAFF_DEFICIT
    DISTURBANCE
    VEHICLE_DEFICIT
    ROAD_CLOSED
    ROAD_TRENCH
    TRACK_MAINTENANCE
    TRAFFIC_ACCIDENT
    TRAFFIC_JAM
    MEDICAL_INCIDENT
    WEATHER_CONDITIONS
    TECHNICAL_FAILURE
    TEST
    ROAD_MAINTENANCE
    SWITCH_FAILURE
    STATE_VISIT
    POWER_FAILURE
    MISPARKED_VEHICLE
    PUBLIC_EVENT
  }

  enum AlertImpact {
    DELAYED
    POSSIBLY_DELAYED
    REDUCED_TRANSPORT
    CANCELLED
    POSSIBLE_DEVIATIONS
    RETURNING_TO_NORMAL
    DISRUPTION_ROUTE
    DEVIATING_SCHEDULE
    IRREGULAR_DEPARTURES
    IRREGULAR_DEPARTURES_MAX_15
    IRREGULAR_DEPARTURES_MAX_30
    VENDING_MACHINE_OUT_OF_ORDER
    BICYCLE_STATION_OUT_OF_ORDER
    BICYCLE_SYSTEM_OUT_OF_ORDER
    REDUCED_BICYCLE_PARK_CAPACITY
    OTHER
    NO_TRAFFIC_IMPACT
    UNKNOWN
  }

  type Alert {
    id: ID!
    level: AlertLevel!
    category: AlertCategory!
    distribution: AlertDistribution!
    impact: AlertImpact!
    affectedId: String!
    startDateTime: DateTime!
    endDateTime: DateTime!
    publishedDateTime: DateTime!
    updatedDateTime: DateTime
    title: String!
    description: String!
    url: String
  }

  type Cancellation {
    id: ID!
    routeId: String!
    direction: Direction!
    departureDate: Date!
    journeyStartTime: Time!
    reason: String
    isCancelled: Boolean
  }
`
