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

export class JoreDataSource extends GraphQLDataSource {
  baseURL = JORE_URL

  async getAllLines() {
    const response = await this.query(LINES, {})
    return get(response, 'data.allLines.nodes', [])
  }
}
