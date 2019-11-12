import express from 'express'
import {
  DomainGroup,
  getSettings,
  initSettings,
  saveAssignments,
  saveAutoGroups,
  setUIMessage,
} from '../datasources/transitlogServer'
import { compact, difference, get, uniq } from 'lodash'
import join from 'proper-url-join'
import { PATH_PREFIX } from '../constants'
import { createGroup, requestGroups } from '../auth/authService'
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
          .split(',')
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
    let domainGroups: DomainGroup[] = createDomainGroupsFromInput(groupAssignments)
    const existingGroups = await requestGroups()

    const newGroups = compact(
      domainGroups.reduce((groupsArray: string[], { domain = '', groups = [] }) => {
        const domainGroupName = domain.replace(/\..*$/g, '')

        if (domainGroupName) {
          groupsArray.push(domainGroupName)
          groups.push(domainGroupName)
        }

        return uniq([...groupsArray, ...groups])
      }, [])
    )

    const groupsToCreate = difference(
      newGroups,
      get(existingGroups, 'resources', []).map(({ name }) => name)
    )

    if (groupsToCreate.length !== 0) {
      // Create groups for each group name that didn't exist yet
      for (const groupName of groupsToCreate) {
        await createGroup(groupName)
      }
    }

    domainGroups = domainGroups.map((domainGroup) => {
      const { domain, groups } = domainGroup

      return {
        domain,
        groups: uniq(groups),
      }
    })

    await saveAutoGroups(domainGroups)
    res.redirect(prefixedAdminPath)
  })

  return adminRouter
}
