import * as express from 'express'
import * as AuthService from './authService'
import { ALLOW_DEV_LOGIN, HSL_GROUP_NAME, REDIRECT_URI } from '../constants'
import { getSettings } from '../datasources/transitlogServer'
import { compact, difference, flatten, get, groupBy, map, uniq } from 'lodash'

interface IAuthRequest {
  code: string
  redirect_uri?: string
}

interface IAuthResponse {
  isOk: boolean
  email?: string
  groups?: string[]
}

const authorize = async (req: express.Request, res: express.Response) => {
  const authRequest = req.body as IAuthRequest
  const { code, redirect_uri = REDIRECT_URI } = authRequest

  if (!code) {
    console.log('No authorization code')
    res.sendStatus(401)
    return
  }

  if (ALLOW_DEV_LOGIN === 'true' && code === 'dev') {
    return devLogin(req, res)
  }

  const settings = await getSettings()
  const domainGroups = settings.domain_groups
  const autoDomainGroups = settings.auto_domain_groups

  // Merge domain groups and auto-created groups into one domain groups array.
  const assignGroups = map(
    groupBy(domainGroups.concat(autoDomainGroups), 'domain'),
    (mergedDomainGroups, domain) => {
      const groups = flatten(uniq(mergedDomainGroups.map(({ groups }) => groups)))

      return {
        domain,
        groups,
      }
    }
  )

  const tokenResponse = await AuthService.requestAccessToken(code, redirect_uri)

  if (req.session && tokenResponse.access_token) {
    req.session.accessToken = tokenResponse.access_token
    const userInfo = await AuthService.requestUserInfo(req.session.accessToken)

    req.session.email = userInfo.email
    req.session.groups = userInfo.groups
    req.session.userId = userInfo.userId

    const email = get(req, 'session.email', '')
    const sessionGroups = req.session.groups
    const emailDomainGroups = assignGroups.filter((dg) => email.endsWith(dg.domain))
    const groupAssignments = uniq(flatten(emailDomainGroups.map(({ groups }) => groups)))
    const assignToGroups = difference(groupAssignments, sessionGroups)

    if (assignToGroups.length !== 0) {
      console.log('Updating groups.')
      const groupsResponse = await AuthService.requestGroups()

      // Get IDs for each group and remove undefineds.
      const groupIds = compact(
        assignToGroups.map((groupName) => {
          const resources = get(groupsResponse, 'resources', [])
          return get(resources.find((element) => element.name === groupName), 'id', '')
        })
      )

      const userResponse = await AuthService.requestInfoByUserId(req.session.userId)
      const memberships = get(userResponse, 'memberOf', [])
      const groups = [...memberships, ...groupIds]

      await AuthService.setGroup(req.session.userId, groups)
      const newUserInfo = await AuthService.requestUserInfo(req.session.accessToken)

      if (newUserInfo) {
        req.session.groups = newUserInfo.groups
        console.log(`User's groups updated.`)
      }
    }

    const response: IAuthResponse = {
      isOk: true,
      email: userInfo.email,
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
    req.session.groups = ['Admin', 'hsl', 'hsl-admin']

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
