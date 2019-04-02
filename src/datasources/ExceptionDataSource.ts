import { GraphQLDataSource } from '../utils/GraphQLDataSource'
import { get } from 'lodash'
import { JORE_URL } from '../constants'
import { EXCEPTION_DAYS_QUERY } from '../queries/exceptionDayQueries'

export class ExceptionDataSource extends GraphQLDataSource {
  baseURL = JORE_URL

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
