import express from 'express'
import {
  DomainGroup,
  getSettings,
  initSettings,
  saveAssignments,
  setUIMessage,
} from '../../datasources/transitlogServer'
import { get } from 'lodash'
import join from 'proper-url-join'
import { PATH_PREFIX } from '../../constants'

export const adminController = async (adminPath) => {
  await initSettings()

  const prefixedAdminPath = join(PATH_PREFIX, adminPath)
  const adminRouter = express.Router()

  adminRouter.get('/', async (req, res) => {
    const currentState = await getSettings()
    res.render('Admin', { adminPath: prefixedAdminPath, settings: currentState })
  })

  adminRouter.post('/set-ui-message', async (req, res) => {
    const message = get(req, 'body.ui_message', '') || ''
    await setUIMessage(message)
    res.redirect(prefixedAdminPath)
  })

  adminRouter.post('/set-groups', async (req, res) => {
    const groupAssignments = get(req, 'body.group_assignments', '') || ''

    // Split assignments by newline and create "DomainGroups".
    const domainGroups: DomainGroup[] = groupAssignments
      .split('\n')
      .filter((line) => !!line.trim())
      .reduce((allGroups: DomainGroup[], line) => {
        const assignment = line.split(/\s*=\s*/)
        const domain = (assignment[0] || '').trim()
        const groups = (assignment[1] || '')
          .split(/\s*,\s*/)
          .map((s) => s.trim())
          .filter((g) => g)

        if (groups.length === 0 || !domain) {
          return allGroups
        }

        allGroups.push({
          domain,
          groups,
        })

        return allGroups
      }, [])

    await saveAssignments(domainGroups)
    res.redirect(prefixedAdminPath)
  })

  return adminRouter
}
