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

export async function setItem<T>(key: string, value: T) {
  const client = await getRedis()
  const setValue = JSON.stringify(value)
  return client.set(key, setValue)
}

export async function getItem<T>(key): Promise<T[] | null> {
  const client = await getRedis()
  const cachedVal = await client.get(key)

  if (!cachedVal) {
    return null
  }

  return JSON.parse(cachedVal)
}

export async function cacheFetch<DataType = any>(cacheKey, fetchData) {
  if (!cacheKey) {
    return fetchData()
  }

  const cachedData = await getItem<DataType>(cacheKey)

  if (cachedData) {
    return cachedData
  }

  const data = await fetchData()
  await setItem<DataType>(cacheKey, data)

  return data
}
