import { DocumentNode } from 'graphql'

declare module '*.graphql' {
  const content: DocumentNode
  export default content
}

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
