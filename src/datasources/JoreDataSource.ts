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
import { ROUTE_GEOMETRY, ROUTES } from '../queries/routeQueries'
import { Direction } from '../types/generated/schema-types'
import { EQUIPMENT } from '../queries/equipmentQueries'

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
    return get(response, 'data.allRoutes.nodes', [])
  }

  async getStops(): Promise<JoreStop[]> {
    const response = await this.query(STOPS, {})
    return get(response, 'data.allStops.nodes', null)
  }

  async getEquipment(): Promise<JoreEquipment[]> {
    const response = await this.query(EQUIPMENT, {})
    return get(response, 'data.allEquipment.nodes', null)
  }
}
