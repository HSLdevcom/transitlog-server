import { AuthenticationError } from 'apollo-server-errors'

export type AuthenticatedValue<T> = AuthenticationError | T | null

export function isAuthenticationError(obj: any): obj is AuthenticationError {
  return obj instanceof AuthenticationError
}

export type AuthenticatedUser = null | {
  email: string
  _test: boolean
  accessToken: string
  groups: string[]
}
