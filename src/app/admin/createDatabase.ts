import { databases, getKnex } from '../../knex'

const knex = getKnex(databases.JORE)
const schema = 'transitlog'
const settingsTable = 'transitlog_settings'

export async function createDatabase() {
  const settingsExist = await knex.schema.withSchema(schema).hasTable(settingsTable)

  if (!settingsExist) {
    await knex.schema.withSchema(schema).createTable(settingsTable, (table) => {
      table.string('key').primary()
      table.jsonb('value').defaultTo('{}')
    })
  }
}
