import * as express from 'express'
import {
  IAccessToken,
  logoutFromIdentityProvider,
  requestAccessToken,
  requestUserInfo,
} from './authService'
import { ALLOW_DEV_LOGIN, REDIRECT_URI } from '../constants'
import { get } from 'lodash'
import { assignUserToGroups } from './groupAssignments'
import { addSeconds } from 'date-fns'

interface IAuthRequest {
  code: string
  isTest?: boolean
  redirect_uri?: string
}

interface IAuthResponse {
  isOk: boolean
  expiresAt?: number
  email?: string
  groups?: string[]
}

const authorize = async (req: express.Request, res: express.Response) => {
  const authRequest = req.body as IAuthRequest
  const { code, isTest = false, redirect_uri = REDIRECT_URI } = authRequest

  if (!code) {
    console.log('No authorization code')
    res.sendStatus(401)
    return
  }

  if (ALLOW_DEV_LOGIN === 'true' && code === 'dev') {
    return devLogin(req, res)
  }

  let accessToken = ''
  let expiresAt = new Date().getTime() / 1000
  let tokenResponse: IAccessToken | string = ''

  // When testing, we get the access token directly.
  if (isTest) {
    accessToken = code
    tokenResponse = 'test'
  } else {
    tokenResponse = await requestAccessToken(code, redirect_uri)
    accessToken = tokenResponse.access_token
  }

  let userEmail = ''

  if (req.session && accessToken) {
    const expiresIn = get(tokenResponse, 'expires_in', 0)
    const refreshToken = get(tokenResponse, 'refresh_token', 0)
    expiresAt = addSeconds(expiresAt, expiresIn).getTime() / 1000

    req.session.accessToken = accessToken
    req.session.expiresAt = expiresAt
    req.session.refreshToken = refreshToken
    let userInfo = await requestUserInfo(accessToken, isTest)

    if (userInfo) {
      userEmail = get(userInfo, 'email', isTest ? 'testing@hsl.fi' : '')
      userInfo = await assignUserToGroups(userInfo)

      req.session.email = userEmail
      req.session._test = isTest
      req.session.groups = get(userInfo, 'groups')
      req.session.userId = get(userInfo, 'userId')
    }
  }

  if (userEmail) {
    const response: IAuthResponse = {
      isOk: true,
      expiresAt,
      email: userEmail,
    }
    res.status(200).json(response)
  } else {
    console.log('No access token: ', tokenResponse)
    const response: IAuthResponse = {
      isOk: false,
    }
    res.status(401).send(response)
  }
}

const devLogin = (req: express.Request, res: express.Response) => {
  if (process.env.ALLOW_DEV_LOGIN !== 'true') {
    console.log('Dev login not allowed.')

    const response: IAuthResponse = {
      isOk: false,
    }

    res.status(401).send(response)
  } else if (req.session) {
    req.session.accessToken = 'dev'
    req.session.email = 'dev@hsl.fi'
    req.session.groups = ['Admin', 'HSL'] // ['operator', 'op_22', 'nobina']

    const response: IAuthResponse = {
      isOk: true,
      email: req.session.email,
    }
    res.status(200).json(response)
  } else {
    const response: IAuthResponse = {
      isOk: false,
    }
    res.status(400).json(response)
  }
}

const checkExistingSession = async (req: express.Request, res: express.Response) => {
  if (req.session && req.session.accessToken) {
    const response: IAuthResponse = {
      isOk: true,
      email: req.session.email,
    }
    res.status(200).json(response)
    return
  }

  const response: IAuthResponse = {
    isOk: false,
  }

  res.status(200).send(response)
}

const logout = async (req: express.Request, res: express.Response) => {
  if (req.session && req.session.accessToken) {
    if (req.session.accessToken !== 'dev') {
      await logoutFromIdentityProvider(req.session.accessToken)
    }

    req.session.destroy(() => {
      res.sendStatus(200)
    })
  } else {
    res.sendStatus(401)
  }
}

export default {
  authorize,
  checkExistingSession,
  logout,
}
