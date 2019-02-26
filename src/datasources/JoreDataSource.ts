import { GraphQLDataSource } from '../utils/GraphQLDataSource'
import { gql } from 'apollo-server'
import { get } from 'lodash'
import { JORE_URL } from '../constants'
import {
  Route as JoreRoute,
  Line as JoreLine,
  Stop as JoreStop,
} from '../types/generated/jore-types'
import { LINES } from '../queries/lineQueries'
import { STOPS, STOPS_BY_BBOX } from '../queries/stopQueries'
import { ROUTES } from '../queries/routeQueries'

export class JoreDataSource extends GraphQLDataSource {
  baseURL = JORE_URL

  async getLines(): Promise<JoreLine[]> {
    const response = await this.query(LINES, {})
    return get(response, 'data.allLines.nodes', [])
  }

  async getRoutes(): Promise<JoreRoute[]> {
    const response = await this.query(ROUTES, {})
    return get(response, 'data.allRoutes.nodes', [])
  }

  async getStops(): Promise<JoreStop[]> {
    const response = await this.query(STOPS, {})
    return get(response, 'data.allStops.nodes', [])
  }

  async getStopsByBbox(bbox): Promise<JoreStop[]> {
    const response = await this.query(STOPS_BY_BBOX, {
      variables: bbox,
    })
    return get(response, 'data.stopsByBbox.nodes', [])
  }
}
