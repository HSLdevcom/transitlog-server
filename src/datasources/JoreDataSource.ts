import { GraphQLDataSource } from '../utils/GraphQLDataSource'
import { get } from 'lodash'
import { JORE_URL } from '../constants'
import {
  Route as JoreRoute,
  Line as JoreLine,
  Stop as JoreStop,
  Equipment as JoreEquipment,
} from '../types/generated/jore-types'
import { LINES } from '../queries/lineQueries'
import { STOPS } from '../queries/stopQueries'
import { JOURNEY_ROUTE, ROUTE_GEOMETRY, ROUTE_INDEX, ROUTES } from '../queries/routeQueries'
import { Direction } from '../types/generated/schema-types'
import { EQUIPMENT } from '../queries/equipmentQueries'
import { getDayTypeFromDate } from '../utils/getDayTypeFromDate'
import { filterByDateChains } from '../utils/filterByDateChains'

export class JoreDataSource extends GraphQLDataSource {
  baseURL = JORE_URL

  async getLines(): Promise<JoreLine[]> {
    const response = await this.query(LINES, {})
    return get(response, 'data.allLines.nodes', null)
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

  async getStops(): Promise<JoreStop[]> {
    const response = await this.query(STOPS, {})
    return get(response, 'data.allStops.nodes', null)
  }

  async getEquipment(): Promise<JoreEquipment[]> {
    const response = await this.query(EQUIPMENT, {})
    return get(response, 'data.allEquipment.nodes', null)
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
}
