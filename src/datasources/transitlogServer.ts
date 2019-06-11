import { getKnex } from '../knex'
import { createDatabase } from '../app/admin/createDatabase'
import { merge } from 'lodash'
import { Transaction } from 'knex'

const knex = getKnex()
const schema = 'transitlog'
const settingsTable = 'transitlog_settings'

const defaultSettings = {
  ui_message: {
    date: '',
    message: '',
  },
  domain_groups: [],
  auto_domain_groups: [],
}

export const upsert = async (key, data, trx) => {
  const hasRecord = await knex
    .withSchema(schema)
    .transacting(trx)
    .first('key')
    .from(settingsTable)
    .where({ key })

  if (hasRecord) {
    return knex
      .withSchema(schema)
      .transacting(trx)
      .from(settingsTable)
      .where({ key })
      .update({ value: JSON.stringify(data) })
  }

  return knex
    .withSchema(schema)
    .transacting(trx)
    .insert({ key, value: JSON.stringify(data) })
    .into(settingsTable)
}

export async function getSettings(trx?: Transaction) {
  let query = knex
    .withSchema(schema)
    .select('*')
    .from(settingsTable)

  if (trx) {
    query = query.transacting(trx)
  }

  const settings = await query
  return settings.reduce((obj, row) => {
    obj[row.key] = row.value
    return obj
  }, {})
}

export async function setUIMessage(message = '') {
  return knex
    .withSchema(schema)
    .update({
      value: JSON.stringify({ date: message ? new Date() : '', message: message || '' }),
    })
    .into(settingsTable)
    .where('key', 'ui_message')
}

export async function initSettings(reset = false) {
  await createDatabase()

  return knex.transaction(async (trx) => {
    const settingsMap = await getSettings(trx)

    const initialSettings = reset ? defaultSettings : merge(defaultSettings, settingsMap)
    const ops: Array<Promise<any>> = []

    for (const [key, value] of Object.entries(initialSettings)) {
      const op = upsert(key, value, trx)
      ops.push(op)
    }

    return Promise.all(ops)
  })
}
