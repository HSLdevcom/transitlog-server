import { orderBy } from 'lodash'
import { Vehicles } from '../types/EventsDb'

export const getVehicleEventsAtStop = (events: Vehicles[], stopId: string) => {
  const stopEvents: Vehicles[] = []

  // Collect all events that match the stopId, but break the loop as soon
  // as another stopId is seen since the events stop being valid at that point.
  // This prevents cases where the the start of another journey is falsely logged
  // at the end of a previous journey, giving the impression of the vehicle
  // teleporting to the start when the journey is concluded. This depends on
  // the events being ordered in ascending order by the time, which they should be.
  let didFindStop = false

  for (const pos of events) {
    const eventStopId = pos.stop ? pos.stop + '' : null
    if (!!eventStopId && eventStopId === stopId) {
      didFindStop = true
      stopEvents.push(pos)
      continue
    }

    // Break only if it already found a stop. Otherwise only the origin stop will work.
    if (didFindStop) {
      break
    }
  }

  return orderBy(stopEvents, 'tsi', 'desc')
}
