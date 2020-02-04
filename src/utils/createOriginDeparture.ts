import { JoreDepartureWithOrigin, JoreOriginDeparture } from '../types/Jore'
import { extraDepartureType } from './extraDepartureType'

export const createOriginDeparture = (
  departure: JoreDepartureWithOrigin
): JoreOriginDeparture => {
  return {
    hours: departure.origin_hours || 0,
    minutes: departure.origin_minutes || 0,
    stop_id: departure.origin_stop_id || '',
    departure_id: departure.origin_departure_id || 0,
    is_next_day: departure.origin_is_next_day || false,
    extra_departure: extraDepartureType(departure?.origin_extra_departure || 'N'),
    day_type: departure.day_type,
    route_id: departure.route_id,
    direction: departure.direction,
    date_begin: departure.origin_date_begin || '',
    date_end: departure.origin_date_end || '',
  }
}
