import { Vehicles } from '../../types/generated/hfp-types'
import { JourneyEvent } from '../../types/generated/schema-types'
import { TZ } from '../../constants'
import moment from 'moment-timezone'

export function createJourneyEventObject(journeyEvent: Vehicles): JourneyEvent {
  return {
    receivedAt: moment.tz(journeyEvent.received_at, TZ).toISOString(true),
    recordedAt: moment.tz(journeyEvent.tst, TZ).toISOString(true),
    recordedAtUnix: parseInt(journeyEvent.tsi, 10),
    recordedTime: Time!,
    nextStopId: String,
    lat: Float!,
    lng: Float!,
    doorStatus: Boolean,
    velocity: Float,
    delay: Int,
    heading: Int,
  }
}
