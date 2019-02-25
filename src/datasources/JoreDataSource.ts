import { GraphQLDataSource } from '../utils/GraphQLDataSource'
import { gql } from 'apollo-server'
import { get } from 'lodash'

const JORE_URL = 'https://dev-kartat.hsldev.com/jore-history/graphql'

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

export class JoreDataSource extends GraphQLDataSource {
  baseURL = JORE_URL

  async getAllLines() {
    try {
      const response = await this.query(LINES, {})
      return get(response, 'data.allLines.nodes', [])
    } catch (error) {
      console.error(error)
    }
  }
}
