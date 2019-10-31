import {
  requestGroups,
  requestInfoByUserId,
  setGroup,
  requestUserInfo,
  IUserInfo,
} from './authService'
import { getSettings } from '../datasources/transitlogServer'
import { groupBy, flatten, uniq, difference, compact, get, map } from 'lodash'

export async function assignUserToGroups(userInfo: IUserInfo) {
  if (!userInfo.email) {
    return
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

  const sessionGroups = userInfo.groups
  const emailDomainGroups = assignGroups.filter((dg) => userInfo.email.endsWith(dg.domain))
  const groupAssignments = uniq(flatten(emailDomainGroups.map(({ groups }) => groups)))
  const assignToGroups = difference(groupAssignments, sessionGroups)

  if (assignToGroups.length !== 0) {
    console.log(`Assigning groups: ${assignToGroups.join(', ')}`)
    const groupsResponse = await requestGroups()
    const resources = get(groupsResponse, 'resources', [])

    if (resources.length === 0) {
      console.log('No groups returned from auth service.')
      return
    }

    // Get IDs for each group and remove undefineds.
    const groupIds = compact(
      assignToGroups.map((groupName) => {
        return get(resources.find((element) => element.name === groupName), 'id', '')
      })
    )

    const userResponse = await requestInfoByUserId(userInfo.userId)
    const memberships = get(userResponse, 'memberOf', [])
    const groups = [...memberships, ...groupIds]

    await setGroup(userInfo.userId, groups)
    const newUserInfo = await requestUserInfo(userInfo.accessToken)

    if (newUserInfo) {
      userInfo.groups = newUserInfo.groups
      console.log(`User's groups updated.`)
    }
  }
}
