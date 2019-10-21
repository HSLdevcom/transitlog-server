import Redis, { Redis as RedisType } from 'ioredis'
import { REDIS_HOST, REDIS_PORT } from './constants'
import { get } from 'lodash'

let redisClient: RedisType | null = null

export async function getRedis() {
  if (redisClient) {
    return redisClient
  }

  const client = new Redis({
    host: REDIS_HOST,
    port: REDIS_PORT,
    lazyConnect: true,
  })

  redisClient = client

  try {
    await client.connect()
  } catch (err) {
    console.log(err.message)
  }

  return redisClient
}

export async function clearAll() {
  const client = await getRedis()
  return client.flushall()
}

export async function setItem<T>(key: string, value: T, ttlConfig?: string | any[]) {
  const client = await getRedis()
  const setValue = JSON.stringify(value)
  return client.set(key, setValue, ttlConfig || [])
}

export async function getItem<T>(key): Promise<T | null> {
  const client = await getRedis()
  const cachedVal = await client.get(key)

  if (!cachedVal) {
    return null
  }

  return JSON.parse(cachedVal)
}

const currentQueries = new Map()

export async function cacheFetch<DataType = any>(
  cacheKey: false | string | ((data?: DataType) => string | false),
  fetchData: () => Promise<DataType | false | null>,
  ttl: number | ((data: DataType) => number) = 30 * 24 * 60 * 60,
  forceFetch: boolean = false
): Promise<DataType | null> {
  if (!cacheKey) {
    const uncachedData = await fetchData()
    return uncachedData || null
  }

  // The cacheKey function should be able to return a cacheKey without the data if
  // the cacheKey is supposed to be useful for retrieving data.
  const computedCacheKey = typeof cacheKey === 'function' ? cacheKey() : cacheKey

  const fetchFromCacheOrDb = async (usingCacheKey) => {
    if (usingCacheKey && !forceFetch) {
      const cachedData = await getItem<DataType>(usingCacheKey)

      if (cachedData) {
        return cachedData
      }
    }

    let data

    try {
      data = await fetchData()
    } catch (err) {
      console.log(err)
      console.log(usingCacheKey, get(err, 'message', 'Data fetching error!'))
    }

    if (!data || (typeof data.length !== 'undefined' && data.length === 0)) {
      return null
    }

    const ttlValue = typeof ttl === 'function' ? ttl(data) : ttl
    const ttlConfig = ttlValue > 0 ? ['EX', ttlValue] : []

    // Create a cache key based on the data if a function was provided.
    const useCacheKey = typeof cacheKey === 'function' ? cacheKey(data) : usingCacheKey

    if (useCacheKey) {
      await setItem<DataType>(useCacheKey, data, ttlConfig)
    }

    return data
  }

  let data
  let queryPromise = currentQueries.get(computedCacheKey)

  if (!queryPromise) {
    queryPromise = fetchFromCacheOrDb(computedCacheKey)
    currentQueries.set(computedCacheKey, queryPromise)
  }

  data = await queryPromise
  currentQueries.delete(computedCacheKey)

  return data
}
