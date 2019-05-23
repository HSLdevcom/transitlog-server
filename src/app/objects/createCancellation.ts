import { CancellationDataType, DBCancellation, DBCancellationStatus } from '../../types/EventsDb'
import {
  AlertCategory,
  Cancellation,
  CancellationEffect,
  CancellationSubcategory,
  CancellationType,
} from '../../types/generated/schema-types'
import { get } from 'lodash'
import moment from 'moment-timezone'
import { TZ } from '../../constants'

export function createCancellation(cancellation: DBCancellation): Cancellation {
  const cancellationData: CancellationDataType | null = cancellation.data || null

  return {
    routeId: cancellation.route_id,
    direction: cancellation.direction_id,
    departureDate: cancellation.start_date,
    journeyStartTime: cancellation.start_time,
    title: get(cancellationData, 'title', ''),
    description: get(cancellationData, 'description', ''),
    category: get(cancellationData, 'category', AlertCategory.Other),
    subCategory: get(cancellationData, 'sub_category', CancellationSubcategory.UnknownCause),
    isCancelled: cancellation.status === DBCancellationStatus.CANCELED,
    cancellationType: get(
      cancellationData,
      'deviation_cases_type',
      CancellationType.CancelDeparture
    ),
    cancellationEffect: get(
      cancellationData,
      'affected_departures_type',
      CancellationEffect.CancelEntireDeparture
    ),
    lastModifiedDateTime: moment.tz(cancellation.last_modified, TZ).toISOString(true),
  }
}
