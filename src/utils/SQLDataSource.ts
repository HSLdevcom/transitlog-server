import { DataSource } from 'apollo-datasource'
import knexTinyLogger from 'knex-tiny-logger'
import SQLCache from './SQLCache'
import Knex from 'knex'
import { DEBUG } from '../constants'

class SQLDataSource extends DataSource {
  context
  knex: Knex
  db: Knex
  sqlCache: SQLCache
  log: boolean

  constructor({ log }: { log?: boolean }) {
    super()
    this.log = log || false
  }

  initialize(config) {
    this.context = config.context
    this.db = this.knex

    if (DEBUG === 'true' && this.log) {
      knexTinyLogger(this.db) // Add a logging utility for debugging
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
