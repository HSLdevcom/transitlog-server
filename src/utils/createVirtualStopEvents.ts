import { getStopEvents } from './getStopEvents'
import { getLegacyStopArrivalEvent } from './getStopArrivalData'
import { getStopDepartureEvent } from './getStopDepartureData'
import { EventType, Vehicles } from '../types/EventsDb'
import { get } from 'lodash'

export const createVirtualStopEvents = (vehiclePositions, departures): Vehicles[] => {
  const virtualStopEvents: Vehicles[] = []

  for (const departure of departures) {
    // To get the events for a stop, first get all events with the next_stop_id matching
    // the current stop ID and sort by the timestamp in descending order. The departure
    // event will then be the first element in the array.
    const stopEvents = getStopEvents(vehiclePositions, departure.stopId)

    const useDEP = departure.isTimingStop || departure.isOrigin || false

    // Although they have a similar signature, the arrival and departure filters do not
    // work the same way. The arrival looks at door openings and the departure uses the
    // desc-sorted events array.
    const stopArrival = getLegacyStopArrivalEvent(stopEvents)
    const stopDeparture = getStopDepartureEvent(stopEvents, useDEP ? 'DEP' : 'PDE')

    const arrivalEvent = stopArrival ? createVirtualEvent(stopArrival, 'ARS') : null
    const departureEvent = stopDeparture
      ? createVirtualEvent(stopDeparture, useDEP ? 'DEP' : 'PDE')
      : null

    const isMetro = get(arrivalEvent, 'mode', get(departureEvent, 'mode', '')) === 'metro'

    const doorOpenEvent =
      stopArrival && (stopArrival.drst || isMetro)
        ? createVirtualEvent(stopArrival, 'DOO')
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
