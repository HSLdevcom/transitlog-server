import { DataSource } from 'apollo-datasource'
import SQLCache from './SQLCache'
import Knex from 'knex'
import { DEBUG } from '../constants'
import knexLogger from './knexLogger'

class SQLDataSource extends DataSource {
  context
  knex: Knex
  db: Knex
  sqlCache: SQLCache
  log: boolean
  name: string

  constructor({ log, name = 'sqlsource' }: { log?: boolean; name: string }) {
    super()
    this.log = log || false
    this.name = name
  }

  initialize(config) {
    this.context = config.context
    this.db = this.knex

    if (DEBUG === 'true' && this.log) {
      knexLogger(this.db) // Add a logging utility for debugging
    }

    this.sqlCache = new SQLCache(config.cache, this.knex, this.name)
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
