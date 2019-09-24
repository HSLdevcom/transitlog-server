import { getStopEvents } from './getStopEvents'
import { getLegacyStopArrivalEvent } from './getStopArrivalData'
import { getStopDepartureEvent } from './getStopDepartureData'
import { EventType, Vehicles } from '../types/EventsDb'

export const createVirtualStopEvents = (vehiclePositions, departures) => {
  const virtualStopEvents: Vehicles[] = []

  for (const departure of departures) {
    // To get the events for a stop, first get all events with the next_stop_id matching
    // the current stop ID and sort by the timestamp in descending order. The departure
    // event will then be the first element in the array.
    const stopEvents = getStopEvents(vehiclePositions, departure.stopId)

    // Although they have a similar signature, the arrival and departure filters do not
    // work the same way. The arrival looks at door openings and the departure uses the
    // desc-sorted events array.
    const stopArrival = getLegacyStopArrivalEvent(stopEvents)
    const stopDeparture = getStopDepartureEvent(stopEvents)

    const arrivalEvent = stopArrival ? createVirtualEvent(stopArrival, 'ARS') : null
    const departureEvent = stopDeparture ? createVirtualEvent(stopDeparture, 'DEP') : null

    const doorOpenEvent =
      stopArrival && stopArrival.drst ? createVirtualEvent(stopArrival, 'DOO') : null

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
  return {
    ...positionEvent,
    event_type: type,
    stop: positionEvent.stop || positionEvent.next_stop_id || null,
  }
}
