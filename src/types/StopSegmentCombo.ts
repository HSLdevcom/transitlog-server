import { Departure as JoreDeparture } from './generated/jore-types'
import { Stop } from './generated/schema-types'

export interface StopSegmentCombo extends Stop {
  destination: string
  distanceFromPrevious: number
  distanceFromStart: number
  duration: number
  stopIndex: number
  isTimingStop: boolean
  departures?: JoreDeparture[]
}
