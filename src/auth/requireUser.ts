import { intersection } from 'lodash'
import { Request, Response } from 'express'
import {
  ALLOW_DEV_LOGIN,
  DEBUG,
  PATH_PREFIX,
  ADMIN_REDIRECT_URI,
  AUTH_SCOPE,
  AUTH_URI,
  CLIENT_ID,
} from '../constants'
import join from 'proper-url-join'
import { AuthenticatedUser } from '../types/Authentication'
import { createValidVehicleId } from '../utils/createUniqueVehicleId'

export function getUserFromReq(req) {
  const { email = '', groups = [], accessToken = '' } = req.session || {}
  return !accessToken ? null : { email, groups, accessToken }
}

export function requireUser(user: AuthenticatedUser, group?: string | string[]) {
  // Make sure we actually have a user
  if (!user || !user.accessToken || (group && (!user.groups || user.groups.length === 0))) {
    return false
  }

  // Get an array of group requirements
  const groups =
    typeof group === 'string' && group
      ? [group]
      : Array.isArray(group) && group.length !== 0
      ? group
      : []

  // If no groups are required, return true
  if (groups.length === 0) {
    return true
  }

  // Make sure that the user has all the required group memberships
  if (!groups.every((group) => user.groups.includes(group))) {
    return false
  }

  // All good!
  return true
}

export function getUserGroups(user) {
  if (
    !user ||
    !user.accessToken ||
    !user.groups ||
    !Array.isArray(user.groups) ||
    user.groups.length === 0
  ) {
    return []
  }

  return user.groups
}

export const requireVehicleAuthorization = (user: AuthenticatedUser, vehicleId: string) => {
  if (!user) {
    return false
  }

  if (requireUser(user, 'HSL')) {
    return true
  }

  const validVehicleId = createValidVehicleId(vehicleId)
  const [operator = ''] = validVehicleId.split('/')
  const operatorGroup = 'op_' + parseInt(operator, 10)

  return requireUser(user, operatorGroup)
}

export const requireUserMiddleware = (group?: string | string[]) => (
  req: Request,
  res: Response,
  next
) => {
  const user = getUserFromReq(req)

  if (requireUser(user, group)) {
    next()
  } else if (ALLOW_DEV_LOGIN === 'true' && process.env.ADMIN_AUTO_LOGIN_DEV === 'true') {
    // Perform dev login
    res.redirect(join(PATH_PREFIX, 'hslid-redirect', '?code=dev'))
  } else {
    const authUrl = `${AUTH_URI}?ns=hsl-transitlog&client_id=${CLIENT_ID}&redirect_uri=${ADMIN_REDIRECT_URI}&response_type=code&scope=${AUTH_SCOPE}&ui_locales=en`
    res.redirect(authUrl)
  }
}
