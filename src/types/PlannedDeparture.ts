import {
  Direction,
  Maybe,
  PlannedDeparture as PlannedDepartureTime,
  PlannedArrival,
  DepartureStop,
  DepartureJourney,
} from './generated/schema-types'
import { StopSegmentCombo } from './StopSegmentCombo'

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
  stop: StopSegmentCombo | DepartureStop | null
  journey: DepartureJourney | null
  originDepartureTime?: PlannedDepartureTime | null
  plannedArrivalTime: PlannedArrival
  plannedDepartureTime: PlannedDepartureTime
}
