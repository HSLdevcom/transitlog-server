import { mapValues } from 'lodash'
import fs from 'fs-extra'

// For any env variable with the value of "secret", resolve the actual value from the
// associated secrets file. Using sync fs methods for the sake of simplicity,
// since this will only run once when staring the app, sync is OK.
const secretsEnv = mapValues(process.env, (value, key) => {
  const filepath = '/run/secrets/' + key

  if (fs.existsSync(filepath)) {
    return (fs.readFileSync(filepath, { encoding: 'utf8' }) || '').trim()
  }

  return value
})

export const TZ = secretsEnv.TZ || 'Europe/Helsinki'
export const DATE_FORMAT = secretsEnv.DATE_FORMAT || 'YYYY-MM-DD'
export const TIME_FORMAT = secretsEnv.TIME_FORMAT || 'HH:mm:ss'

// DB connections
export const JORE_PG_CONNECTION_STRING = secretsEnv.JORE_PG_CONNECTION_STRING
export const HFP_PG_CONNECTION_STRING = secretsEnv.HFP_PG_CONNECTION_STRING

// URLs
export const PATH_PREFIX = secretsEnv.PATH_PREFIX || '/'

// HSL ID authentication
export const CLIENT_ID = secretsEnv.CLIENT_ID
export const CLIENT_SECRET = secretsEnv.CLIENT_SECRET
export const REDIRECT_URI = secretsEnv.REDIRECT_URI
export const LOGIN_PROVIDER_URI = secretsEnv.LOGIN_PROVIDER_URI

// HSL ID for logging into the admin UI
export const ADMIN_REDIRECT_URI = secretsEnv.ADMIN_REDIRECT_URI
export const AUTH_URI = secretsEnv.AUTH_URI
export const AUTH_SCOPE = secretsEnv.AUTH_SCOPE

// The HSL ID API ID and secret
export const API_CLIENT_ID = secretsEnv.API_CLIENT_ID
export const API_CLIENT_SECRET = secretsEnv.API_CLIENT_SECRET

// HSL ID config
export const HSL_GROUP_NAME = 'HSL'

export const ALLOW_DEV_LOGIN = secretsEnv.ALLOW_DEV_LOGIN || 'false'
export const DEBUG = secretsEnv.DEBUG || 'false'
