import { mapValues } from 'lodash'
import fs from 'fs-extra'

// For any env variable with the value of "secret", resolve the actual value from the
// associated secrets file.
const secretsEnv = mapValues(process.env, (value, key) => {
  if (key.startsWith('FILEPATH_') || value !== 'secret') {
    return value
  }

  const pathEnv = 'FILEPATH_' + key
  if (fs.existsSync(process.env[pathEnv])) {
    return fs.readFileSync(process.env[pathEnv], { encoding: 'utf8' })
  }

  return value
})

export const TZ = secretsEnv.TZ || 'Europe/Helsinki'
export const DATE_FORMAT = secretsEnv.DATE_FORMAT || 'YYYY-MM-DD'
export const TIME_FORMAT = secretsEnv.TIME_FORMAT || 'HH:mm:ss'

// DB connections
export const PG_CONNECTION_STRING = secretsEnv.PG_CONNECTION_STRING

// URLs
export const JORE_URL = secretsEnv.JORE_URL || 'https://dev-kartat.hsldev.com/jore-history/graphql'
export const HFP_URL = secretsEnv.HFP_URL || 'https://sandbox-1.hsldev.com/v1alpha1/graphql'
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
