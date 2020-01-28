import { DBLightPriorityEvent } from '../types/EventsDb'
import { LightPriorityEvent, TlpPriorityLevel } from '../types/generated/schema-types'
import { get } from 'lodash'
import moment from 'moment-timezone'
import { TZ } from '../constants'
import { getJourneyEventTime } from '../utils/time'

const getPriorityLevel = (lightPriorityEvent: LightPriorityEvent) => {
  const priorityLevel = get(lightPriorityEvent, 'tlp_prioritylevel', null)
  if (priorityLevel === null) {
    return null
  }
  return TlpPriorityLevel[
    priorityLevel === 'normal'
      ? 'Normal'
      : priorityLevel === 'high'
      ? 'High'
      : priorityLevel === 'norequest'
      ? 'Norequest'
      : ''
  ]
}

export function createLightPriorityEventObject(
  lightPriorityEvent: DBLightPriorityEvent
): LightPriorityEvent {
  const observedDepartureTime = moment.tz(lightPriorityEvent.tst, TZ)

  return {
    requestId: lightPriorityEvent.tlp_requestid,
    requestType: get(lightPriorityEvent, 'tlp_requesttype', null),
    priorityLevel: getPriorityLevel(lightPriorityEvent),
    reason: get(lightPriorityEvent, 'tlp_reason', null),
    attemptSeq: get(lightPriorityEvent, 'tlp_att_seq', null),
    decision: get(lightPriorityEvent, 'tlp_decision', null),
    junctionId: get(lightPriorityEvent, 'sid', null),
    signalGroupId: get(lightPriorityEvent, 'signal_groupid', null),
    signalGroupNbr: get(lightPriorityEvent, 'tlp_signalgroupnbr', null),
    lineConfigId: get(lightPriorityEvent, 'tlp_line_configid', null),
    pointConfigId: get(lightPriorityEvent, 'tlp_point_configid', null),
    frequency: get(lightPriorityEvent, 'tlp_frequency', null),
    protocol: get(lightPriorityEvent, 'tlp_protocol', null),
    recordedAt: observedDepartureTime.toISOString(true),
    recordedTime: getJourneyEventTime(lightPriorityEvent),
    lat: lightPriorityEvent.lat,
    lng: lightPriorityEvent.long,
    loc: lightPriorityEvent.loc,
  }
}
