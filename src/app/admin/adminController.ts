import express from 'express'
import fs from 'fs-extra'
import path from 'path'

const defaultSettings = {
  uiMessage: '',
  domainGroups: [],
  autoDomainGroups: [],
}

const cwd = process.cwd()
const settingsFile = path.join(cwd, 'data', 'config.json')

export const adminRouter = express.Router()

async function getSettings() {
  const settingsExist = await fs.fileExists(settingsFile)

  if (!settingsExist) {
    await fs.outputJson(settingsFile, defaultSettings)
  }

  return fs.readJson()
}

adminRouter.get('/', async (req, res) => {
  const currentState = ''
  res.render('Admin', {})
})

// adminRouter.post('/set-ui-message', ())
