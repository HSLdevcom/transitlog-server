import 'express-session'

declare module 'express-session' {
  interface SessionData {
    accessToken?: string
    expiresAt?: number
    refreshToken?: string
    email?: string
    _test?: boolean
    groups?: string[]
    userId?: string
  }
}
