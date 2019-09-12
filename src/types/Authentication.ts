import { AuthenticationError } from 'apollo-server-errors'

export type AuthenticatedValue<T> = AuthenticationError | T | null

export function isAuthenticationError(obj: any): obj is AuthenticationError {
  return obj instanceof AuthenticationError
}

export type AuthenticatedUser = null | { accessToken: string; groups: string[] }
