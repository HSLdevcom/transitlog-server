import { Vehicles } from '../../types/generated/hfp-types'
import { JourneyEvent } from '../../types/generated/schema-types'
import { TZ } from '../../constants'
import moment from 'moment-timezone'
import { getJourneyEventTime } from '../../utils/time'

export function createJourneyEventObject(journeyEvent: Vehicles): JourneyEvent {
  return {
    receivedAt: moment.tz(journeyEvent.received_at, TZ).toISOString(true),
    recordedAt: moment.tz(journeyEvent.tst, TZ).toISOString(true),
    recordedAtUnix: parseInt(journeyEvent.tsi, 10),
    recordedTime: getJourneyEventTime(journeyEvent),
    nextStopId: journeyEvent.next_stop_id,
    lat: journeyEvent.lat,
    lng: journeyEvent.long,
    doorStatus: journeyEvent.drst,
    velocity: journeyEvent.spd,
    delay: journeyEvent.dl,
    heading: journeyEvent.hdg,
  }
}
