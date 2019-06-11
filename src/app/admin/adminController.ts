import express from 'express'
import { getSettings, initSettings, setUIMessage } from '../../datasources/transitlogServer'
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

  return adminRouter
}
