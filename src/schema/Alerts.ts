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
    HIDDEN
    CHARGING_SERVICE
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

  enum CancellationSubcategory {
    BREAK_MALFUNCTION
    OUT_OF_FUEL
    FLUID_LEAKAGE
    ELECTRIC_MALFUNCTION
    ENGINE_MALFUNCTION
    OTHER_MALFUNCTION
    OWN_FAULT
    OPPOSITE_FAULT
    FAULT_UNKNOWN
    STAFF_SHORTAGE
    ND_OPERATOR_PLANNING_ERROR
    DRIVER_LATE
    INSUFFICIENT_INSTRUCTIONS_BY_OPERATOR
    INSUFFICIENT_INSTRUCTIONS_BY_AUTHORITY
    NO_VEHICLE_AVAILABLE
    ASSAULT_ON_DRIVER
    ASSAULT_ON_PASSENGER
    ASSAULT_ON_VEHICLE
    PASSED_OUT_PASSENGER
    OTHER_ASSAULT
    UNDRIVEABLE_CONDITIONS
    STUCK_CAUSED_BY_SLIPPERY
    CONGESTION_CAUSED_BY_WEATHER
    SLIPPERY_TRACK
    ROAD_BLOCKED
    VEHICLE_OFF_THE_ROAD_BY_DRIVER_ERROR
    VEHICLE_OFF_THE_ROAD_BY_OTHER_REASON
    MISSPARKED_VEHICLE
    CONGESTION_REASON_UKNOWN
    CONGESTION_CAUSED_BY_ACCIDENT
    DRIVER_SEIZURE
    PASSENGER_SEIZURE
    PASSENGER_INJURED
    OTHER_SEIZURE
    DEVICE_ERROR
    OPERATOR_DEVICE_ERROR
    WRONG_INFORMATION_IN_DEVICE
    ITS_SYSTEM_NOT_INSTALLED
    USER_ERROR
    FALSE_ALARM
    OTHER_ITS_ERROR
    DRIVER_ERROR
    INSUFFICIENT_CAPASITY
    OPERATOR_PERSONNEL_ON_STRIKE
    OTHER_STRIKE
    OTHER_OPERATOR_REASON
    DOOR_MALFUNCTION
    UNKNOWN_CAUSE
    HIDDEN
    OTHER_CHARGING_SERVICE
    OPERATOR_CHARGING_SERVICE
  }

  enum CancellationType {
    CANCEL_DEPARTURE
    DETOUR
    SKIPPED_STOP_CALLS
    EARLY_DEPARTURE
    EARLY_DEPARTURE_FROM_TIMING_POINT
    LATE_DEPARTURE
    DEPARTURED_AFTER_NEXT_JOURNEY
    BLOCK_FIRST_DEPARTURE_LATE
    TIS_ERROR
  }

  enum CancellationEffect {
    CANCEL_ENTIRE_DEPARTURE
    CANCEL_STOPS_FROM_START
    CANCEL_STOPS_FROM_MIDDLE
    CANCEL_STOPS_FROM_END
  }

  type Alert {
    id: String!
    level: AlertLevel!
    category: AlertCategory!
    distribution: AlertDistribution!
    impact: AlertImpact!
    affectedId: String!
    startDateTime: DateTime!
    endDateTime: DateTime!
    lastModifiedDateTime: DateTime!
    title: String!
    description: String!
    url: String
    bulletinId: String!
  }

  type Cancellation {
    id: Int!
    routeId: String!
    direction: Direction!
    departureDate: Date!
    journeyStartTime: Time!
    title: String!
    description: String!
    category: AlertCategory!
    subCategory: CancellationSubcategory!
    isCancelled: Boolean!
    cancellationType: CancellationType!
    cancellationEffect: CancellationEffect!
    lastModifiedDateTime: DateTime!
  }

  input AlertSearchInput {
    all: Boolean
    network: Boolean
    allRoutes: Boolean
    allStops: Boolean
    route: String
    stop: String
  }

  input CancellationSearchInput {
    all: Boolean
    routeId: String
    direction: Int
    departureTime: String
    latestOnly: Boolean
  }
`
