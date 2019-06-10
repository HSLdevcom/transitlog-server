import { intersection } from 'lodash'
import { Request, Response } from 'express'

export function getUserFromReq(req) {
  const { email = '', groups = [], accessToken = '' } = req.session || {}
  return !accessToken ? null : { email, groups, accessToken }
}

export function requireUser(
  user: null | { accessToken: string; groups: string[] },
  group?: string | string[]
) {
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

  // Make sure that the user has all the required group memberships
  if (intersection(user.groups, groups).length !== groups.length) {
    return false
  }

  // All good!
  return true
}

export const requireUserMiddleware = (group?: string | string[]) => (
  req: Request,
  res: Response,
  next
) => {
  const user = getUserFromReq(req)

  if (requireUser(user, group)) {
    next()
  } else {
    // TODO: Create login page and redirect to it
    res.status(403).send('FORBIDDEN')
  }
}
