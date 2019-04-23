import {
  Direction,
  Maybe,
  PlannedDeparture as PlannedDepartureTime,
  PlannedArrival,
  DepartureJourney,
  RouteSegment,
} from './generated/schema-types'

export interface PlannedDeparture {
  id: string
  stopId: string
  dayType: string
  equipmentType?: Maybe<string>
  equipmentIsRequired?: Maybe<boolean>
  equipmentColor?: Maybe<string>
  operatorId?: Maybe<string>
  routeId: string
  direction: Direction
  terminalTime?: Maybe<number>
  recoveryTime?: Maybe<number>
  departureId?: Maybe<number>
  extraDeparture?: Maybe<string>
  isNextDay?: Maybe<boolean>
  isTimingStop?: Maybe<boolean>
  index?: Maybe<number>
  mode?: Maybe<string>
  stop: RouteSegment | null
  journey: DepartureJourney | null
  originDepartureTime?: PlannedDepartureTime | null
  plannedArrivalTime: PlannedArrival
  plannedDepartureTime: PlannedDepartureTime
}
