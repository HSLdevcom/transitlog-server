import { JoreDepartureWithOrigin } from '../types/Jore'

export const createOriginDeparture = (departure: JoreDepartureWithOrigin) => {
  return {
    hours: departure.origin_hours || 0,
    minutes: departure.origin_minutes || 0,
    stop_id: departure.origin_stop_id || '',
    departure_id: departure.origin_departure_id || 0,
    is_next_day: departure.origin_is_next_day || false,
    extra_departure: departure.origin_extra_departure || 'N',
    day_type: departure.day_type,
    route_id: departure.route_id,
    direction: departure.direction,
  }
}
