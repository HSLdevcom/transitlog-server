import Redis from 'ioredis'
import { Redis as RedisType } from 'ioredis'
import set = Reflect.set

let redisClient: RedisType | null = null

async function getRedis() {
  if (redisClient) {
    return redisClient
  }

  redisClient = new Redis({
    host: '0.0.0.0',
    port: 6379,
  })

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

  if (Array.isArray(cachedVal)) {
    return cachedVal.map((val) => JSON.parse(val))
  }

  return JSON.parse(cachedVal)
}

export async function hasItem(key) {
  const client = await getRedis()
  return client.exists(key)
}
