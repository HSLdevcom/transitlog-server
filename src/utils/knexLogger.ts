import chalk from 'chalk'

export type KnexTinyLoggerOptions = {
  logger?: Function
  bindings?: boolean
}

type KnexTinyLoggerQuery = {
  sql: string
  bindings: any
  startTime: [number, number]
}

const COLORIZE = {
  primary: chalk.magenta,
  error: chalk.red,
  success: chalk.cyan,
}

export function start() {
  return process.hrtime()
}

export function stop(startTime: [number, number]): number {
  const diff = process.hrtime(startTime)
  const duration = diff[0] * 1e3 + diff[1] * 1e-6
  return duration
}

/**
 * Decorate `knex` instance with logger
 *
 * @param {Object} knex - knex instance
 * @param {Object} options
 * @param {Function} [options.logger=console.log]
 * @param {Boolean} [options.bindings=true]
 * @return {Object} knex - knex instance
 */

export default function knexLogger(knex: any, options: KnexTinyLoggerOptions = {}) {
  const { logger = console.log, bindings: withBindings = true } = options
  const queries: Map<string, KnexTinyLoggerQuery> = new Map()
  const print = makeQueryPrinter(knex, { logger, withBindings })

  return knex
    .on('query', handleQuery)
    .on('query-error', handleQueryError)
    .on('query-response', handleQueryResponse)

  function handleQuery({ __knexQueryUid: queryId, sql, bindings }) {
    const startTime = start()
    queries.set(queryId, { sql, bindings, startTime })
  }

  function handleQueryError(_error, { __knexQueryUid: queryId }) {
    withQuery(queryId, ({ sql, bindings, duration }) => {
      print({ sql, bindings, duration }, COLORIZE.error)
    })
  }

  function handleQueryResponse(_response, { __knexQueryUid: queryId }) {
    withQuery(queryId, ({ sql, bindings, duration }) => {
      print({ sql, bindings, duration }, COLORIZE.success)
    })
  }

  function withQuery(queryId, fn) {
    const query = queries.get(queryId)

    if (!query) {
      console.log('Query disappeared')
      return
    }

    const { sql, bindings, startTime } = query
    const duration = stop(startTime)
    fn({ sql, bindings, duration })

    queries.delete(queryId)
  }
}

function makeQueryPrinter(knex, { logger, withBindings }) {
  return function print({ sql, bindings, duration }, colorize: Function) {
    const sqlRequest = knex.client._formatQuery(sql, withBindings ? bindings : null)

    logger('%s %s', COLORIZE.primary(`SQL (${duration.toFixed(3)} ms)`), colorize(sqlRequest))
  }
}
