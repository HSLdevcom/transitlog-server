import Knex from 'knex'
import { PG_CONNECTION_STRING } from './constants'

let knex: Knex | null = null

export function getKnex(): Knex {
  if (knex) {
    return knex
  }

  knex = Knex({
    dialect: 'postgres',
    client: 'pg',
    connection: PG_CONNECTION_STRING,
    pool: {
      min: 1,
      max: 50,
    },
  })

  return knex
}
