import * as express from 'express'
import * as AuthService from './authService'
import { ALLOW_DEV_LOGIN, HSL_GROUP_NAME, REDIRECT_URI } from '../constants'
import { getSettings } from '../datasources/transitlogServer'
import { compact, difference, flatten, get, groupBy, map, uniq } from 'lodash'
import { IAccessToken } from './authService'
import { assignUserToGroups } from './groupAssignments'

interface IAuthRequest {
  code: string
  isTest?: boolean
  redirect_uri?: string
}

interface IAuthResponse {
  isOk: boolean
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
  let tokenResponse: IAccessToken | string = ''

  // When testing, we get the access token directly.
  if (isTest) {
    accessToken = code
    tokenResponse = 'test'
  } else {
    tokenResponse = await AuthService.requestAccessToken(code, redirect_uri)
    accessToken = tokenResponse.access_token
  }

  let userEmail = ''

  if (req.session && accessToken) {
    req.session.accessToken = accessToken
    let userInfo = await AuthService.requestUserInfo(accessToken, isTest)

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
    req.session.groups = ['Admin', 'HSL'] // ['Admin', 'operator', 'op_22', 'nobina']

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
      await AuthService.logoutFromIdentityProvider(req.session.accessToken)
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
