import { Vehicles } from '../../types/generated/hfp-types'
import { JourneyEvent } from '../../types/generated/schema-types'
import { TZ } from '../../constants'
import moment from 'moment-timezone'
import { getJourneyEventTime } from '../../utils/time'

export function createJourneyEventObject(event: Vehicles, id: string): JourneyEvent {
  const unix = parseInt(event.tsi, 10)

  return {
    id: `journey_event_${id}_${unix}`,
    receivedAt: moment.tz(event.received_at, TZ).toISOString(true),
    recordedAt: moment.tz(event.tst, TZ).toISOString(true),
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
