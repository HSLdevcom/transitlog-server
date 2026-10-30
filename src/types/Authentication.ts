import { GraphQLError } from 'graphql'

export class AuthenticationError extends GraphQLError {
  constructor(message: string) {
    super(message, { extensions: { code: 'UNAUTHENTICATED' } })
    Object.defineProperty(this, 'name', { value: 'AuthenticationError' })
  }
}

export type AuthenticatedValue<T> = AuthenticationError | T | null

export function isAuthenticationError(obj: any): obj is AuthenticationError {
  return obj instanceof AuthenticationError
}

export type AuthenticatedUser = null | {
  email: string
  _test: boolean
  accessToken: string
  refreshToken?: string
  expiresAt?: number
  groups: string[]
}
