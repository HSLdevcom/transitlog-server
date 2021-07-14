import { JourneyEvent } from '../types/generated/schema-types'
import { differenceInSeconds } from 'date-fns'
import { get, last } from 'lodash'
import { Vehicles } from '../types/EventsDb'

function isHfp(event: Vehicles | JourneyEvent): event is Vehicles {
  return (event as Vehicles).journey_start_time !== undefined
}

export const journeyInProgress = (events: Vehicles[] | JourneyEvent[] | null) => {
  if (!events || events.length === 0) {
    return false
  }

  const lastEvent = last<Vehicles | JourneyEvent>(events)

  if (!lastEvent) {
    return false
  }

  const lastEventTime = get(lastEvent, isHfp(lastEvent) ? 'tst' : 'recordedAt')

  // Check the time since the last event
  const eventsEndNowDiff = differenceInSeconds(new Date(), lastEventTime)

  // If the time is more than 5 minutes, we can safely say that the journey has concluded.
  if (eventsEndNowDiff > 5 * 60) {
    return false
  }

  return true
}
