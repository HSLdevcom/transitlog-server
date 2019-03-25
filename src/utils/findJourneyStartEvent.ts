import { Vehicles } from '../types/generated/hfp-types'

export const findJourneyStartEvent = (events: Vehicles[] = []): Vehicles | null => {
  // Default to the first hfp event, ie when the data stream from this vehicle started
  let startEvent = events[0]

  if (!startEvent) {
    return null
  }

  for (let i = 1; i < events.length; i++) {
    const current = events[i]

    // Loop through the positions and find when the next_stop_id prop changes.
    // The hfp event BEFORE this is when the journey started, ie when
    // the vehicle departed the first terminal.
    if (current && current.next_stop_id !== startEvent.next_stop_id) {
      startEvent = events[i - 1]
      break
    }
  }

  return startEvent
}
