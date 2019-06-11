import { getKnex } from '../knex'
import { createDatabase } from '../app/admin/createDatabase'
import { merge } from 'lodash'
import { Transaction } from 'knex'

const knex = getKnex()
const schema = 'transitlog'
const settingsTable = 'transitlog_settings'

export type UIMessage = {
  date: string
  message: string
}

export type DomainGroup = {
  domain: string
  groups: string[]
}

export type AutoDomainGroup = {
  domain: string
}

export type TransitlogSettings = {
  ui_message: UIMessage
  domain_groups: DomainGroup[]
  auto_domain_groups: AutoDomainGroup[]
}

const defaultSettings: TransitlogSettings = {
  ui_message: {
    date: '',
    message: '',
  },
  domain_groups: [],
  auto_domain_groups: [],
}

export const upsert = async (key, data, trx?) => {
  const transact = (query) => (trx ? query.transacting(trx) : query)

  const hasRecord = await transact(
    knex
      .withSchema(schema)
      .first('key')
      .from(settingsTable)
      .where({ key })
  )

  if (hasRecord) {
    return transact(
      knex
        .withSchema(schema)
        .from(settingsTable)
        .where({ key })
        .update({ value: JSON.stringify(data) })
    )
  }

  return transact(
    knex
      .withSchema(schema)
      .insert({ key, value: JSON.stringify(data) })
      .into(settingsTable)
  )
}

export async function getSettings(trx?: Transaction): Promise<TransitlogSettings> {
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
  return upsert(
    'ui_message',
    JSON.stringify({ date: message ? new Date() : '', message: message || '' })
  )
}

export async function saveAssignments(assignments) {
  return upsert('domain_groups', assignments)
}

export async function initSettings(reset = false) {
  await createDatabase()

  return knex.transaction(async (trx) => {
    const settingsMap = await getSettings(trx)

    const initialSettings: TransitlogSettings = reset
      ? defaultSettings
      : merge(defaultSettings, settingsMap)

    const ops: Array<Promise<any>> = []

    for (const [key, value] of Object.entries(initialSettings)) {
      const op = upsert(key, value, trx)
      ops.push(op)
    }

    return Promise.all(ops)
  })
}
