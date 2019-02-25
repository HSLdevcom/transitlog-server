import { GraphQLDataSource } from '../utils/GraphQLDataSource'
import { gql } from 'apollo-server'
import { get } from 'lodash'
import { JORE_URL } from '../constants'

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

  async getLines() {
    const response = await this.query(LINES, {})
    return get(response, 'data.allLines.nodes', [])
  }

  async getRoutes() {
    const response = await this.query(ROUTES, {})
    return get(response, 'data.allRoutes.nodes', [])
  }
}
