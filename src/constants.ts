import { mapValues, orderBy } from 'lodash'
import fs from 'fs-extra'

const SECRETS_PATH = '/run/secrets/'

// For any env variable with the value of "secret", resolve the actual value from the
// associated secrets file. Using sync fs methods for the sake of simplicity,
// since this will only run once when staring the app, sync is OK.
const secrets = (fs.existsSync(SECRETS_PATH) && fs.readdirSync(SECRETS_PATH)) || []

const secretsEnv = mapValues(process.env, (value, key) => {
  const matchingSecrets: string[] = secrets.filter((secretFile) => secretFile.startsWith(key))

  const currentSecret: string | null =
    orderBy(
      matchingSecrets,
      (secret) => {
        const secretVersion = parseInt(secret[secret.length - 1], 10)
        return isNaN(secretVersion) ? 0 : secretVersion
      },
      'desc'
    )[0] || null

  const filepath = SECRETS_PATH + currentSecret

  if (fs.existsSync(filepath)) {
    return (fs.readFileSync(filepath, { encoding: 'utf8' }) || '').trim()
  }

  return value
})

export const TZ = secretsEnv.TZ || 'Europe/Helsinki'
export const DATE_FORMAT = secretsEnv.DATE_FORMAT || 'YYYY-MM-DD'
export const TIME_FORMAT = secretsEnv.TIME_FORMAT || 'HH:mm:ss'

export const JORE_PG_CONNECTION = {
  host: secretsEnv.JORE_POSTGRES_HOST,
  port: secretsEnv.JORE_POSTGRES_PORT,
  user: secretsEnv.JORE_POSTGRES_USER,
  password: secretsEnv.JORE_POSTGRES_PASSWORD,
  database: secretsEnv.JORE_POSTGRES_DB,
  ssl: true,
}

export const HFP_PG_CONNECTION = {
  host: secretsEnv.HFP_POSTGRES_HOST,
  port: secretsEnv.HFP_POSTGRES_PORT,
  user: secretsEnv.HFP_POSTGRES_USER,
  password: secretsEnv.HFP_POSTGRES_PASSWORD,
  database: secretsEnv.HFP_POSTGRES_DB,
}

// URLs
export const PATH_PREFIX = secretsEnv.PATH_PREFIX || '/'

// HSL ID authentication
export const CLIENT_ID = secretsEnv.CLIENT_ID
export const TESTING_CLIENT_ID = secretsEnv.TESTING_CLIENT_ID
export const CLIENT_SECRET = secretsEnv.CLIENT_SECRET
export const TESTING_CLIENT_SECRET = secretsEnv.TESTING_CLIENT_SECRET
export const REDIRECT_URI = secretsEnv.REDIRECT_URI
export const LOGIN_PROVIDER_URI = secretsEnv.LOGIN_PROVIDER_URI
export const TESTING_LOGIN_PROVIDER_URI = secretsEnv.TESTING_LOGIN_PROVIDER_URI

// HSL ID for logging into the admin UI
export const ADMIN_REDIRECT_URI = secretsEnv.ADMIN_REDIRECT_URI
export const AUTH_URI = secretsEnv.AUTH_URI
export const TESTING_AUTH_URI = secretsEnv.TESTING_AUTH_URI
export const AUTH_SCOPE = secretsEnv.AUTH_SCOPE

// The HSL ID API ID and secret
export const API_CLIENT_ID = secretsEnv.API_CLIENT_ID
export const API_CLIENT_SECRET = secretsEnv.API_CLIENT_SECRET

// HSL ID config
export const HSL_GROUP_NAME = 'HSL'

export const ALLOW_DEV_LOGIN = secretsEnv.ALLOW_DEV_LOGIN || 'false'
export const DEBUG = secretsEnv.DEBUG || 'false'

export const REDIS_HOST = secretsEnv.REDIS_HOST || '0.0.0.0'
export const REDIS_PORT: string | number = secretsEnv.REDIS_PORT || 6379
export const DISABLE_CACHE = secretsEnv.DISABLE_CACHE === 'true'
export const COOKIE_SECRET = secretsEnv.COOKIE_SECRET
export const SECURE_COOKIE = secretsEnv.SECURE_COOKIE === 'true'
