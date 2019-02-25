export const TZ = process.env.TZ || 'Europe/Helsinki'
export const DATE_FORMAT = process.env.DATE_FORMAT || 'YYYY-MM-DD'
export const TIME_FORMAT = process.env.TIME_FORMAT || 'HH:mm:ss'
export const MAX_JORE_YEAR = process.env.MAX_JORE_YEAR || 2050

// URLs
export const JORE_URL =
  process.env.JORE_URL || 'https://dev-kartat.hsldev.com/jore-history/graphql'
export const HFP_URL =
  process.env.HFP_URL || 'https://sandbox-1.hsldev.com/v1alpha1/graphql'
