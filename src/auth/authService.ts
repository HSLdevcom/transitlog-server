import * as express from 'express'
import nodeFetch, { Response } from 'node-fetch'
import {
  API_CLIENT_ID,
  API_CLIENT_SECRET,
  CLIENT_ID,
  CLIENT_SECRET,
  LOGIN_PROVIDER_URI,
  REDIRECT_URI,
  TESTING_LOGIN_PROVIDER_URI,
} from '../constants'

const authHash = Buffer.from(`${API_CLIENT_ID}:${API_CLIENT_SECRET}`).toString('base64')
const clientAuthHash = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')

export interface IAccessToken {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token: string
  scope: string
}

export interface IUserInfo {
  userId: string
  email: string
  emailVerified: string
  groups: string[]
  accessToken: string
}

const checkAccessMiddleware = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  // TODO: implement refresh token
  /*const {
    email = '',
    groups = [],
    accessToken = '',
    refreshToken = '',
    expiresAt = 0,
    _test = false,
  } = req.session || {}*/

  next()
}

const requestAccessToken = async (
  code: string,
  redirectUri = REDIRECT_URI
): Promise<IAccessToken> => {
  const url = `${LOGIN_PROVIDER_URI}/openid/token?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&grant_type=authorization_code&code=${code}&redirect_uri=${redirectUri}`

  const response = await nodeFetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  })
  return (await response.json()) as IAccessToken
}

const requestUserInfo = async (
  accessToken: string,
  isTest = false
): Promise<IUserInfo | null> => {
  const useProviderUrl = isTest ? TESTING_LOGIN_PROVIDER_URI : LOGIN_PROVIDER_URI
  const url = `${useProviderUrl}/openid/userinfo`

  try {
    const response = await nodeFetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    const responseJson = await response.json()

    return {
      userId: responseJson.sub,
      email: responseJson.email,
      emailVerified: responseJson.email_verified,
      groups: responseJson['https://oneportal.trivore.com/claims/groups'],
      accessToken,
    }
  } catch (err) {
    console.error(err)
  }

  return null
}

const introspectToken = async (
  accessToken: string,
  isTest = false
): Promise<IUserInfo | null> => {
  const useProviderUrl = isTest ? TESTING_LOGIN_PROVIDER_URI : LOGIN_PROVIDER_URI
  const url = `${useProviderUrl}/openid/introspect`

  try {
    const response = await nodeFetch(url, {
      method: 'POST',
      body: JSON.stringify({ token: accessToken, token_type_hint: 'access_token' }),
      headers: {
        Authorization: `Basic ${clientAuthHash}`,
      },
    })

    const responseJson = await response.json()

    if (responseJson) {
      return responseJson
    }
  } catch (err) {
    console.error(err)
  }

  return null
}

const logoutFromIdentityProvider = async (accessToken: string): Promise<Object> => {
  const url = `${LOGIN_PROVIDER_URI}/openid/logout`
  return nodeFetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
}

const createGroup = async (group): Promise<Response> => {
  const url = `${LOGIN_PROVIDER_URI}/api/rest/v1/group`
  return nodeFetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Basic ${authHash}`,
    },
    body: JSON.stringify({
      name: group,
      description: 'Auto-created with Transitlog Admin.',
      nsCode: 'hsl-transitlog',
    }),
  })
}

const setGroup = async (userId: string, groups: string[]): Promise<Response> => {
  const url = `${LOGIN_PROVIDER_URI}/api/rest/v1/user/${userId}`
  const response = await nodeFetch(url, {
    method: 'PUT',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Basic ${authHash}`,
    },
    body: JSON.stringify({
      memberOf: groups,
    }),
  })

  return response.json()
}

const requestGroups = async (): Promise<Response> => {
  const url = `${LOGIN_PROVIDER_URI}/api/rest/v1/group`

  const groupsResponse = await nodeFetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Basic ${authHash}`,
    },
  })

  return groupsResponse.json()
}

const requestInfoByUserId = async (userId: string): Promise<Response> => {
  const url = `${LOGIN_PROVIDER_URI}/api/rest/v1/user/${userId}`
  const response = await nodeFetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Basic ${authHash}`,
    },
  })

  return response.json()
}

export {
  checkAccessMiddleware,
  requestAccessToken,
  requestUserInfo,
  logoutFromIdentityProvider,
  setGroup,
  createGroup,
  requestGroups,
  requestInfoByUserId,
}
