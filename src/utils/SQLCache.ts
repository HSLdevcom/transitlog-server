import { InMemoryLRUCache } from 'apollo-server-caching'
import DataLoader from 'dataloader'

class SQLCache {
  cache
  loader

  constructor(cache = new InMemoryLRUCache(), knex) {
    this.cache = cache
    this.loader = new DataLoader((rawQueries) =>
      Promise.all(rawQueries.map((rawQuery) => knex.raw(rawQuery)))
    )
  }

  getBatched(query) {
    const queryString = query.toString()
    return this.loader.load(queryString).then((result) => result && result.rows)
  }

  getCached(query, ttl) {
    const queryString = query.toString()
    const cacheKey = `sqlcache:${queryString}`

    return this.cache.get(cacheKey).then((entry) => {
      if (entry) {
        return Promise.resolve(entry)
      }
      return query.then((rows) => {
        if (rows) {
          this.cache.set(cacheKey, rows, ttl)
        }
        return Promise.resolve(rows)
      })
    })
  }

  getBatchedAndCached(query, ttl) {
    const queryString = query.toString()
    const cacheKey = `sqlcache:${queryString}`

    return this.cache.get(cacheKey).then((entry) => {
      if (entry) {
        return Promise.resolve(entry)
      }
      return this.loader
        .load(queryString)
        .then((result) => result && result.rows)
        .then((rows) => {
          if (rows) {
            this.cache.set(cacheKey, rows, ttl)
          }
          return Promise.resolve(rows)
        })
    })
  }
}

export default SQLCache
