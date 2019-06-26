import Knex from 'knex'
import { HFP_PG_CONNECTION, JORE_PG_CONNECTION } from './constants'

export enum databases {
  HFP = 'hfp',
  JORE = 'jore',
}

const knexes: { [id: string]: Knex } = {}

const connections = {
  jore: JORE_PG_CONNECTION,
  hfp: HFP_PG_CONNECTION,
}

export function getKnex(id: databases = databases.JORE): Knex {
  if (knexes[id]) {
    return knexes[id]
  }

  knexes[id] = Knex({
    dialect: 'postgres',
    client: 'pg',
    connection: connections[id],
    pool: {
      min: 1,
      max: 50,
    },
  })

  return knexes[id]
}
