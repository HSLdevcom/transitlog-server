import Redis, { Redis as RedisType } from 'ioredis'

let redisClient: RedisType | null = null

async function getRedis() {
  if (redisClient) {
    return redisClient
  }

  const client = new Redis({
    host: '0.0.0.0',
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
  cacheKey,
  fetchData,
  ttl: number | ((data: DataType) => number) = 0
): Promise<DataType | null> {
  if (!cacheKey) {
    return fetchData()
  }

  const cachedData = await getItem<DataType>(cacheKey)

  if (cachedData) {
    return cachedData
  }

  const data = await fetchData()

  if (!data) {
    return null
  }

  const ttlValue = typeof ttl === 'function' ? ttl(data) : ttl
  const ttlConfig = ttlValue > 0 ? ['EX', ttlValue] : []
  await setItem<DataType>(cacheKey, data, ttlConfig)

  return data
}
