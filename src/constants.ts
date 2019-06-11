export const TZ = process.env.TZ || 'Europe/Helsinki'
export const DATE_FORMAT = process.env.DATE_FORMAT || 'YYYY-MM-DD'
export const TIME_FORMAT = process.env.TIME_FORMAT || 'HH:mm:ss'
export const MAX_JORE_YEAR = process.env.MAX_JORE_YEAR || 2050

// DB connections
export const PG_CONNECTION_STRING = process.env.PG_CONNECTION_STRING

// URLs
export const JORE_URL = process.env.JORE_URL || 'https://dev-kartat.hsldev.com/jore-history/graphql'
export const HFP_URL = process.env.HFP_URL || 'https://sandbox-1.hsldev.com/v1alpha1/graphql'
export const PATH_PREFIX = process.env.PATH_PREFIX || '/'

// HSL ID authentication
export const CLIENT_ID = process.env.CLIENT_ID
export const CLIENT_SECRET = process.env.CLIENT_SECRET
export const REDIRECT_URI = process.env.REDIRECT_URI
export const LOGIN_PROVIDER_URI = process.env.LOGIN_PROVIDER_URI

// HSL ID for logging into the admin UI
export const ADMIN_REDIRECT_URI = process.env.ADMIN_REDIRECT_URI
export const AUTH_URI = process.env.AUTH_URI
export const AUTH_SCOPE = process.env.AUTH_SCOPE

// The HSL ID API ID and secret
export const API_CLIENT_ID = process.env.API_CLIENT_ID
export const API_CLIENT_SECRET = process.env.API_CLIENT_SECRET

// HSL ID config
export const HSL_USER_DOMAINS = ['hsl.fi', 'cgi.com', 'developsuperpowers.com']
export const HSL_GROUP_NAME = 'HSL'
