import { getStopEvents } from './getStopEvents'
import { getLegacyStopArrivalEvent } from './getStopArrivalData'
import { EventType, Vehicles } from '../types/EventsDb'
import { get } from 'lodash'
import moment from 'moment'

export const createVirtualStopEvents = (
  vehiclePositions: Vehicles[],
  departures
): Vehicles[] => {
  if (vehiclePositions.length === 0 || departures.length === 0) {
    return []
  }

  const currentTime = moment()
  const virtualStopEvents: Vehicles[] = []

  for (const departure of departures) {
    // It is unnecessary and confusing to create virtual
    // events for the future, so prevent that here.
    if (currentTime.isBefore(moment(departure.plannedDepartureTime.departureDateTime))) {
      continue
    }

    // To get the events for a stop, first get all events with the next_stop_id matching
    // the current stop ID and sort by the timestamp in descending order. The departure
    // event will then be the first element in the array.
    const stopEvents = getStopEvents(vehiclePositions, departure.stopId)

    const isTimingStopOrOrigin = !!departure.isTimingStop || departure.isOrigin || false

    // Although they have a similar signature, the arrival and departure filters do not
    // work the same way. The arrival looks at door openings and the departure uses the
    // desc-sorted events array.
    const stopArrivalEvent = getLegacyStopArrivalEvent(stopEvents)
    const stopDepartureEvent = stopEvents[0]

    const arrivalEvent = stopArrivalEvent ? createVirtualEvent(stopArrivalEvent, 'ARS') : null

    let departureEventType = (stopDepartureEvent.loc === 'ODO' || !isTimingStopOrOrigin
      ? 'PDE'
      : 'DEP') as EventType

    const departureEvent = stopDepartureEvent
      ? createVirtualEvent(stopDepartureEvent, departureEventType)
      : null

    const isMetro = get(arrivalEvent, 'mode', get(departureEvent, 'mode', '')) === 'metro'

    const doorOpenEvent =
      stopArrivalEvent && (stopArrivalEvent.drst || isMetro)
        ? createVirtualEvent(stopArrivalEvent, 'DOO')
        : null

    if (arrivalEvent) {
      virtualStopEvents.push(arrivalEvent)
    }

    if (departureEvent) {
      virtualStopEvents.push(departureEvent)
    }

    if (doorOpenEvent) {
      virtualStopEvents.push(doorOpenEvent)
    }
  }

  return virtualStopEvents
}

function createVirtualEvent(positionEvent: Vehicles, type: EventType): Vehicles {
  const stopId: number | null = positionEvent.stop

  return {
    ...positionEvent,
    event_type: type,
    stop: stopId,
    next_stop_id: null,
    _is_virtual: true,
  }
}
