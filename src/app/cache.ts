import Redis, { Redis as RedisType } from 'ioredis'

let redisClient: RedisType | null = null

async function getRedis() {
  if (redisClient) {
    return redisClient
  }

  const client = new Redis({
    host: process.env.REDIS_HOST,
    port: 6379,
    lazyConnect: true,
  })

  try {
    await client.connect()
  } catch (err) {
    console.error(err)
    process.exit(1)
  }

  redisClient = client
  return redisClient
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

export async function cacheFetch<DataType = any>(
  cacheKey: false | string | ((data?: DataType) => string | false),
  fetchData: () => Promise<DataType | false | null>,
  ttl: number | ((data: DataType) => number) = 30 * 24 * 60 * 60
): Promise<DataType | null> {
  if (!cacheKey) {
    const uncachedData = await fetchData()
    return uncachedData || null
  }

  const computedCacheKey = typeof cacheKey === 'function' ? cacheKey() : cacheKey

  if (computedCacheKey) {
    const cachedData = await getItem<DataType>(computedCacheKey)

    if (cachedData) {
      return cachedData
    }
  }

  const data = await fetchData()

  if (!data) {
    return null
  }

  const ttlValue = typeof ttl === 'function' ? ttl(data) : ttl
  const ttlConfig = ttlValue > 0 ? ['EX', ttlValue] : []

  const useCacheKey = typeof cacheKey === 'function' ? cacheKey(data) : cacheKey

  if (useCacheKey) {
    await setItem<DataType>(useCacheKey, data, ttlConfig)
  }

  return data
}
