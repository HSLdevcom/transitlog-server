const schema = 'transitlog'

exports.up = async function(knex) {
  return knex.schema.withSchema(schema).createTable('transitlog_settings', (table) => {
    table.string('key').primary()
    table.jsonb('value').defaultTo({})
  })
}

exports.down = async function(knex) {
  return knex.schema.withSchema(schema).dropTableIfExists('transitlog_settings')
}

exports.config = {
  schemaName: schema,
  tableName: '_transitlog_migrations',
}
