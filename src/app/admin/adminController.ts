import express from 'express'
import {
  DomainGroup,
  getSettings,
  initSettings,
  saveAssignments,
  saveAutoGroups,
  setUIMessage,
} from '../../datasources/transitlogServer'
import { compact, difference, get, last, uniq } from 'lodash'
import join from 'proper-url-join'
import { PATH_PREFIX } from '../../constants'
import pMap from 'p-map'
import { createGroup, requestGroups } from '../../auth/authService'
import { clearAll } from '../cache'

export const adminController = async (adminPath) => {
  await initSettings()

  const prefixedAdminPath = join(PATH_PREFIX, adminPath)
  const adminRouter = express.Router()

  adminRouter.get('/', async (req, res) => {
    const currentState = await getSettings()
    res.render('Admin', { adminPath: prefixedAdminPath, settings: currentState })
  })

  function createDomainGroupsFromInput(input: string): DomainGroup[] {
    return input
      .split('\n')
      .filter((line) => !!line.trim())
      .reduce((allGroups: DomainGroup[], line) => {
        const assignment = line.split(/\s*=\s*/)
        const domain = (assignment[0] || '').trim().toLowerCase()
        const groups = (assignment[1] || '')
          .split(/\s*,\s*/)
          .map((s) => s.trim())
          .filter((g) => g)

        if (!domain) {
          return allGroups
        }

        allGroups.push({
          domain,
          groups,
        })

        return allGroups
      }, [])
  }

  adminRouter.post('/clear-cache', async (req, res) => {
    await clearAll()
    res.redirect(prefixedAdminPath)
  })

  adminRouter.post('/set-ui-message', async (req, res) => {
    const message = get(req, 'body.ui_message', '') || ''
    await setUIMessage(message)
    res.redirect(prefixedAdminPath)
  })

  adminRouter.post('/set-groups', async (req, res) => {
    const groupAssignments = get(req, 'body.group_assignments', '') || ''

    // Split assignments by newline and create "DomainGroups".
    const domainGroups: DomainGroup[] = createDomainGroupsFromInput(groupAssignments)

    await saveAssignments(domainGroups)
    res.redirect(prefixedAdminPath)
  })

  adminRouter.post('/set-auto-groups', async (req, res) => {
    const groupAssignments = get(req, 'body.auto_group_assignments', '') || ''

    // Split assignments by newline and create "DomainGroups".
    const domainGroups: DomainGroup[] = createDomainGroupsFromInput(groupAssignments)
    const existingGroups = await requestGroups()

    const domains = domainGroups.map(({ domain }) => domain)
    const newGroupNames = compact(
      domains.map((email) => {
        const domain = (last(email.toLowerCase().split('@')) || '') as string

        if (!domain) {
          return
        }

        const groupName = domain.replace(/\..*$/g, '')
        return [groupName, email]
      })
    )

    const groupsToCreate = difference(
      newGroupNames.map(([groupName]) => groupName),
      get(existingGroups, 'resources', []).map(({ name }) => name)
    )

    if (groupsToCreate.length !== 0) {
      // Create groups for each group name that didn't exist yet
      await pMap(groupsToCreate, async (groupName) => createGroup(groupName))
    }

    // Add the newly-created group to the group assignment array for the domain.
    newGroupNames.forEach(([groupName, domain]) => {
      const domainGroup: DomainGroup = domainGroups.find(
        ({ domain: groupDomain }) => domain === groupDomain
      ) as DomainGroup

      domainGroup.groups = uniq([...domainGroup.groups, groupName])
    })

    await saveAutoGroups(domainGroups)
    res.redirect(prefixedAdminPath)
  })

  return adminRouter
}
