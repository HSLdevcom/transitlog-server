import * as express from 'express'
import * as AuthService from './authService'

interface IAuthRequest {
  code: string
}

interface IAuthResponse {
  isOk: boolean
  hasWriteAccess: boolean
  email?: string
}

const authorize = async (req: express.Request, res: express.Response) => {
  const authRequest = req.body as IAuthRequest
  if (!Boolean(authRequest.code)) {
    console.log('No authorization code')
    res.sendStatus(401)
    return
  }
  const tokenResponse = await AuthService.requestAccessToken(authRequest.code)

  if (req.session && tokenResponse.access_token) {
    req.session.accessToken = tokenResponse.access_token
    const userInfo = await AuthService.requestUserInfo(req.session.accessToken)
    req.session.hasWriteAccess = userInfo.hasWriteAccess
    req.session.email = userInfo.email

    const response: IAuthResponse = {
      isOk: true,
      email: userInfo.email,
      hasWriteAccess: userInfo.hasWriteAccess,
    }
    res.status(200).json(response)
  } else {
    console.log('No access token: ', tokenResponse)
    const response: IAuthResponse = {
      isOk: false,
      hasWriteAccess: false,
    }
    res.status(401).send(response)
  }
}

const checkExistingSession = async (req: express.Request, res: express.Response) => {
  if (req.session && req.session.accessToken) {
    const response: IAuthResponse = {
      isOk: true,
      email: req.session.email,
      hasWriteAccess: req.session.hasWriteAccess,
    }
    res.status(200).json(response)
    return
  }
  // TODO: remove when auth works
  console.log('No existing session')
  const response: IAuthResponse = {
    isOk: false,
    hasWriteAccess: false,
  }
  res.status(200).send(response)
}

const logout = async (req: express.Request, res: express.Response) => {
  if (req.session && req.session.accessToken) {
    await AuthService.logoutFromIdentityProvider(req.session.accessToken)
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
