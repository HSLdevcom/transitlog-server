import { DataSource } from 'apollo-datasource'
import knexTinyLogger from 'knex-tiny-logger'
import SQLCache from './SQLCache'
import Knex from 'knex'

const { DEBUG } = process.env

let hasLogger = false

class SQLDataSource extends DataSource {
  context
  knex: Knex
  db: Knex
  sqlCache: SQLCache

  initialize(config) {
    this.context = config.context
    this.db = this.knex

    if (DEBUG && !hasLogger) {
      hasLogger = true // Prevent duplicate loggers
      // knexTinyLogger(this.db) // Add a logging utility for debugging
    }

    this.sqlCache = new SQLCache(config.cache, this.knex)
  }

  getBatched(query) {
    return this.sqlCache.getBatched(query)
  }

  getCached(query, ttl) {
    return this.sqlCache.getCached(query, ttl)
  }

  getCachedAndBatched(query, ttl) {
    return this.sqlCache.getBatchedAndCached(query, ttl)
  }
}

export default SQLDataSource
