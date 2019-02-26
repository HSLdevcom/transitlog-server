import { GraphQLDataSource } from '../utils/GraphQLDataSource'
import { gql } from 'apollo-server'
import { get } from 'lodash'
import { JORE_URL } from '../constants'
import { Route as JoreRoute, Line as JoreLine } from '../types/generated/jore-types'

const LINES = gql`
  query JoreLines {
    allLines {
      nodes {
        lineId
        nameFi
        dateBegin
        dateEnd
        routes {
          totalCount
        }
      }
    }
  }
`

const ROUTES = gql`
  query JoreRoutes {
    allRoutes {
      nodes {
        routeId
        nameFi
        dateBegin
        dateEnd
        direction
        destinationFi
        originFi
        destinationstopId
        originstopId
        line {
          nodes {
            lineId
          }
        }
      }
    }
  }
`

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
}
