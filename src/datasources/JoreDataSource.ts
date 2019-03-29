import { GraphQLDataSource } from '../utils/GraphQLDataSource'
import { get } from 'lodash'
import { JORE_URL } from '../constants'
import {
  Route as JoreRoute,
  Line as JoreLine,
  Stop as JoreStop,
  Equipment as JoreEquipment,
  RouteSegment as JoreRouteSegment,
} from '../types/generated/jore-types'
import { LINES } from '../queries/lineQueries'
import { STOP_BY_ID, STOPS, STOPS_BY_BBOX } from '../queries/stopQueries'
import {
  JOURNEY_ROUTE,
  ROUTE_GEOMETRY,
  ROUTE_INDEX,
  ROUTE_QUERY,
  ROUTE_SEGMENTS,
  ROUTES,
} from '../queries/routeQueries'
import { Direction } from '../types/generated/schema-types'
import { EQUIPMENT, EQUIPMENT_BY_ID } from '../queries/equipmentQueries'
import { getDayTypeFromDate } from '../utils/getDayTypeFromDate'
import { filterByDateChains } from '../utils/filterByDateChains'
import { DEPARTURE_STOP, DEPARTURES_FOR_STOP_QUERY } from '../queries/departureQueries'
import { EXCEPTION_DAYS_QUERY } from '../queries/exceptionDayQueries'

export class JoreDataSource extends GraphQLDataSource {
  baseURL = JORE_URL

  async getLines(): Promise<JoreLine[]> {
    const response = await this.query(LINES, {})
    return get(response, 'data.allLines.nodes', null)
  }

  async getRoute(routeId, direction): Promise<JoreRoute[]> {
    const response = await this.query(ROUTE_QUERY, {
      variables: {
        routeId,
        direction: direction + '',
      },
    })
    return get(response, 'data.allRoutes.nodes', null)
  }

  async getRoutes(): Promise<JoreRoute[]> {
    const response = await this.query(ROUTES, {})
    return get(response, 'data.allRoutes.nodes', null)
  }

  async getRouteGeometry(routeId: string, direction: Direction): Promise<JoreRoute[]> {
    const response = await this.query(ROUTE_GEOMETRY, {
      variables: { routeId, direction: direction + '' },
    })
    return get(response, 'data.allRoutes.nodes', null)
  }

  async getStop(stopId: string): Promise<JoreStop> {
    const response = await this.query(STOP_BY_ID, {
      variables: {
        stopId,
      },
    })
    return get(response, 'data.stopByStopId', null)
  }

  async getStops(): Promise<JoreStop[]> {
    const response = await this.query(STOPS, {})
    return get(response, 'data.allStops.nodes', null)
  }

  async getStopsByBBox(bbox): Promise<JoreStop[]> {
    const response = await this.query(STOPS_BY_BBOX, {
      variables: {
        ...bbox,
      },
    })
    return get(response, 'data.stopsByBbox.nodes', null)
  }

  async getEquipment(): Promise<JoreEquipment[]> {
    const response = await this.query(EQUIPMENT, {})
    return get(response, 'data.allEquipment.nodes', null)
  }

  async getEquipmentById(vehicleId: string | number, operatorId: string): Promise<JoreEquipment[]> {
    const joreVehicleId = vehicleId + ''
    const joreOperatorId = (operatorId + '').padStart(4, '0')

    const response = await this.query(EQUIPMENT_BY_ID, {
      variables: {
        vehicleId: joreVehicleId,
        operatorId: joreOperatorId,
      },
    })

    return get(response, 'data.allEquipment.nodes[0]', null)
  }

  async getRouteSegments(routeId: string, direction: Direction): Promise<JoreRouteSegment[]> {
    const response = await this.query(ROUTE_SEGMENTS, {
      variables: {
        routeId,
        direction: direction + '',
      },
    })
    return get(response, 'data.allRoutes.nodes', null)
  }

  async getRouteIndex(routeId: string, direction: Direction) {
    const response = await this.query(ROUTE_INDEX, {
      variables: {
        routeId,
        direction: direction + '',
      },
    })
    return get(response, 'data.allRoutes.nodes', null)
  }

  async getJourneyRoute(
    routeId: string,
    direction: Direction,
    dateBegin: string,
    dateEnd: string,
    date: string
  ): Promise<JoreRoute> {
    const dayType = getDayTypeFromDate(date)
    const response = await this.query(JOURNEY_ROUTE, {
      variables: {
        routeId,
        direction: direction + '',
        dateBegin,
        dateEnd,
        dayType,
      },
    })

    return get(response, 'data.route', null)
  }

  async getFullRoute(routeId, direction, date) {
    const availableRoutes = await this.getRouteIndex(routeId, direction)

    if (!availableRoutes || availableRoutes.length === 0) {
      return null
    }

    const validRoutes = filterByDateChains<JoreRoute>([availableRoutes], date)

    if (validRoutes.length === 0) {
      return null
    }

    const route = validRoutes[0]
    return this.getJourneyRoute(
      route.routeId,
      route.direction,
      route.dateBegin,
      route.dateEnd,
      date
    )
  }

  async getDepartureStop(stopId): Promise<JoreStop | null> {
    if (!stopId) {
      return null
    }

    const response = await this.query(DEPARTURE_STOP, {
      variables: {
        stopId,
      },
    })

    return get(response, 'data.stop', null)
  }

  async getDepartures(stopId, date) {
    if (!stopId || !date) {
      return null
    }

    const dayType = getDayTypeFromDate(date)
    const response = await this.query(DEPARTURES_FOR_STOP_QUERY, {
      variables: {
        dayType,
        stopId,
      },
    })

    return get(response, 'data.allDepartures.nodes', null)
  }

  async getExceptionDaysForYear(year) {
    if (!year) {
      return null
    }

    const response = await this.query(EXCEPTION_DAYS_QUERY, {
      variables: {
        year,
      },
    })

    return get(response, 'data', {})
  }
}
