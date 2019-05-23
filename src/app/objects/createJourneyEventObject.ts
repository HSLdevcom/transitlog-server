import { JourneyEvent } from '../../types/generated/schema-types'
import { TZ } from '../../constants'
import moment from 'moment-timezone'
import { getJourneyEventTime } from '../../utils/time'
import { Vehicles } from '../../types/EventsDb'

export function createJourneyEventObject(event: Vehicles, id: string): JourneyEvent {
  const unix = parseInt(event.tsi, 10)
  const ts = moment.tz(event.tst, TZ).toISOString(true)

  return {
    id: `journey_event_${id}_${unix}`,
    receivedAt: ts, // Change if you need the received_at time (it also needs to be included in the db query SELECT)
    recordedAt: ts,
    recordedAtUnix: unix,
    recordedTime: getJourneyEventTime(event),
    nextStopId: event.next_stop_id,
    lat: event.lat,
    lng: event.long,
    doorStatus: event.drst,
    velocity: event.spd,
    delay: event.dl,
    heading: event.hdg,
  }
}
