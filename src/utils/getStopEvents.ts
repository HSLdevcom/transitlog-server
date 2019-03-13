import { orderBy } from 'lodash'
import { Vehicles } from '../types/generated/hfp-types'

export const getStopEvents = (events: Vehicles[], stopId: string) => {
  const stopEvents = events.filter((pos) => pos.next_stop_id === stopId)
  const maxDiff = 60
  const validEvents: Vehicles[] = []

  for (const event of stopEvents) {
    const prevEvent = validEvents[validEvents.length - 1]

    if (!prevEvent) {
      validEvents.push(event)
      continue
    }

    const diff = Math.abs(parseInt(event.tsi, 10) - parseInt(prevEvent.tsi, 10))

    if (diff <= maxDiff) {
      validEvents.push(event)
    }
  }

  return orderBy(validEvents, 'tsi', 'desc')
}
