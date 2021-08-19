import { knex, Knex } from 'knex'

import { PG_CONNECTION } from './constants'

let knexInstance: Knex | null = null

export function getKnex(): Knex {
  if (knexInstance) {
    return knexInstance
  }

  knexInstance = knex({
    dialect: 'postgres',
    client: 'pg',
    connection: PG_CONNECTION,
    pool: {
      min: 0,
      max: 50,
    },
  })

  return knexInstance
}
