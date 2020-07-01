import { Vehicles } from '../types/EventsDb'

interface StopInfo {
  isOrigin?: boolean | null
  isTimingStop?: boolean | null
}

export function getCorrectDepartureEventType(
  stopEvents: Vehicles[],
  departure: StopInfo = { isTimingStop: false, isOrigin: false }
) {
  let { isTimingStop = false, isOrigin = false } = departure

  // Are there PDE events at all?
  let hasPdeEvents = stopEvents.some((evt) => evt.event_type === 'PDE')

  // Are there PDE events using ODO?
  let hasOdoPdeEvents = stopEvents.some(
    (evt) => evt.event_type === 'PDE' && ['ODO', 'MAN'].includes(evt.loc || '')
  )

  // In cases when there are PDE events but they use GPS, should the stop fall back to DEP events?
  let usesDepIfGpsPde = isOrigin || isTimingStop || false

  // Stop redundant DEP events from being stop events if there are PAS events.
  let hasPasEvents = stopEvents.some((evt) => evt.event_type === 'PAS')

  if (
    (!hasPdeEvents && !hasPasEvents) ||
    (hasPdeEvents && !hasOdoPdeEvents && usesDepIfGpsPde)
  ) {
    return 'DEP'
  }

  return 'PDE'
}
