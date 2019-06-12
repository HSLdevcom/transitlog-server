import * as express from 'express'
import * as AuthService from './authService'
import { HSL_GROUP_NAME } from '../constants'
import { getSettings } from '../datasources/transitlogServer'
import { get, difference, compact, groupBy, map, flatten } from 'lodash'

interface IAuthRequest {
  code: string
}

interface IAuthResponse {
  isOk: boolean
  email?: string
  groups?: string[]
}

const authorize = async (req: express.Request, res: express.Response) => {
  const authRequest = req.body as IAuthRequest
  const code = authRequest.code

  if (!code) {
    console.log('No authorization code')
    res.sendStatus(401)
    return
  }

  if (code === 'dev') {
    return devLogin(req, res)
  }

  const settings = await getSettings()
  const domainGroups = settings.domain_groups
  const autoDomainGroups = settings.auto_domain_groups

  // Merge domain groups and auto-created groups into one domain groups array.
  const assignGroups = map(
    groupBy(domainGroups.concat(autoDomainGroups), 'domain'),
    (mergedDomainGroups, domain) => {
      const groups = flatten(mergedDomainGroups.map(({ groups }) => groups))

      return {
        domain,
        groups,
      }
    }
  )

  const tokenResponse = await AuthService.requestAccessToken(code)

  if (req.session && tokenResponse.access_token) {
    req.session.accessToken = tokenResponse.access_token
    const userInfo = await AuthService.requestUserInfo(req.session.accessToken)
    req.session.email = userInfo.email
    req.session.groups = userInfo.groups
    req.session.userId = userInfo.userId

    const domain = req.session.email.split('@')[1]
    const sessionGroups = req.session.groups
    const groupAssignments = get(assignGroups.find((dg) => dg.domain === domain), 'groups', [])
    const assignToGroups = difference(groupAssignments, sessionGroups)

    if (assignToGroups.length !== 0) {
      console.log('Updating groups.')
      const groupsResponse = await AuthService.requestGroups()

      // Get IDs for each group and remove undefineds.
      const groupIds = compact(
        assignToGroups.map(
          (groupName) => groupsResponse.resources.find((element) => element.name === groupName).id
        )
      )

      const userResponse = await AuthService.requestInfoByUserId(req.session.userId)
      const userResponseBody = await userResponse.json()

      const groups = [...userResponseBody.memberOf, ...groupIds]
      const response = await AuthService.setGroup(req.session.userId, groups)
      const body = await response.json()
      // TODO: Check response and log failures

      req.session.groups = groups
      console.log(`User's groups updated.`)
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
    req.session.groups = [HSL_GROUP_NAME, 'Admin']

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
