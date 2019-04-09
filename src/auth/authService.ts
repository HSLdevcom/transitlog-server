import * as express from 'express'
import nodeFetch from 'node-fetch'
// import {CLIENT_ID, CLIENT_SECRET, REDIRECT_URI, LOGIN_PROVIDER_URI} from '../constants';

const CLIENT_ID = '1424368089733870'
const CLIENT_SECRET = 'cUGcWzTEAvzID856Iukhu5ioMa7TSJbI'
const REDIRECT_URI = 'http://localhost:3000'
const LOGIN_PROVIDER_URI = 'https://hslid-uat.cinfra.fi'

interface IAccessToken {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token: string
  scope: string
}

interface IUserInfo {
  userId: string
  email: string
  emailVerified: string
}

const checkAccessMiddleware = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  next()
}

const requestAccessToken = async (code: string): Promise<IAccessToken> => {
  const url = `${LOGIN_PROVIDER_URI}/openid/token?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&grant_type=authorization_code&code=${code}&redirect_uri=${REDIRECT_URI}`
  const response = await nodeFetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  })
  return (await response.json()) as IAccessToken
}

const requestUserInfo = async (accessToken: string): Promise<IUserInfo> => {
  const url = `${LOGIN_PROVIDER_URI}/openid/userinfo`
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
  }
}

const logoutFromIdentityProvider = async (accessToken: string): Promise<Object> => {
  const url = `${LOGIN_PROVIDER_URI}/openid/logout`
  return nodeFetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
}

export { checkAccessMiddleware, requestAccessToken, requestUserInfo, logoutFromIdentityProvider }
