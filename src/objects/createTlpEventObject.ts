import { DBTlpEvent } from '../types/EventsDb'
import { TlpEvent, TlpPriorityLevel } from '../types/generated/schema-types'
import { get } from 'lodash'
import moment from 'moment-timezone'
import { TZ } from '../constants'
import { getJourneyEventTime } from '../utils/time'

const getPriorityLevel = (tlpEvent: TlpEvent) => {
  const priorityLevel = get(tlpEvent, 'tlp_prioritylevel', null)
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

export function createTlpEventObject(tlpEvent: DBTlpEvent): TlpEvent {
  const observedDepartureTime = moment.tz(tlpEvent.tst, TZ)

  return {
    requestId: tlpEvent.tlp_requestid,
    requestType: get(tlpEvent, 'tlp_requesttype', null),
    priorityLevel: getPriorityLevel(tlpEvent),
    reason: get(tlpEvent, 'tlp_reason', null),
    attemptSeq: get(tlpEvent, 'tlp_att_seq', null),
    decision: get(tlpEvent, 'tlp_decision', null),
    junctionId: get(tlpEvent, 'sid', null),
    signalGroupId: get(tlpEvent, 'signal_groupid', null),
    signalGroupNbr: get(tlpEvent, 'tlp_signalgroupnbr', null),
    lineConfigId: get(tlpEvent, 'tlp_line_configid', null),
    pointConfigId: get(tlpEvent, 'tlp_point_configid', null),
    frequency: get(tlpEvent, 'tlp_frequency', null),
    protocol: get(tlpEvent, 'tlp_protocol', null),
    recordedAt: observedDepartureTime.toISOString(true),
    recordedTime: getJourneyEventTime(tlpEvent),
    lat: tlpEvent.lat,
    lng: tlpEvent.long,
    loc: tlpEvent.loc,
  }
}
