import moment from 'moment-timezone'
import express from 'express'
import type { RequestHandler } from 'express'
import rateLimit from 'express-rate-limit'
import cors from 'cors'
import { ADMIN_GROUP_NAME, COOKIE_SECRET, SECURE_COOKIE, TZ } from './constants'
import { types } from 'pg'
import schema from './schema'

import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@as-integrations/express4'
import { makeExecutableSchema } from '@graphql-tools/schema'
import { InMemoryLRUCache } from '@apollo/utils.keyvaluecache'
import { resolvers } from './resolvers/'
import { JoreDataSource } from './datasources/JoreDataSource'
import { HFPDataSource } from './datasources/HFPDataSource'
import authEndpoints from './auth/authEndpoints'
import { checkAccessMiddleware } from './auth/authService'
import { getRedis } from './cache'
import path from 'path'
import { createEngine } from 'express-react-views'
import { getUserFromReq, requireUserMiddleware } from './auth/requireUser'
import { adminController } from './admin/adminController'
import { cleanup } from './utils/cleanup'
import { getKnex } from './knex'

// Set the default timezone for the app
moment.tz.setDefault(TZ)

types.setTypeParser(1082, (val) => val)

import session from 'express-session'
import connectRedis from 'connect-redis'

const RedisStore = connectRedis(session)

const apolloCache = new InMemoryLRUCache()

const ORIGIN = process.env.REDIRECT_URI

const createDataSources = () => {
  const dataSources = {
    JoreAPI: new JoreDataSource(),
    HFPAPI: new HFPDataSource(),
  }

  Object.values(dataSources).forEach((dataSource) => {
    dataSource.initialize({
      context: {},
      cache: apolloCache,
    })
  })

  return dataSources
}

type User = {
  email: string
  groups: string[]
  accessToken: string
}

type RequestContext = {
  user: null | User
  skipCache: boolean
  dataSources: {
    JoreAPI: JoreDataSource
    HFPAPI: HFPDataSource
  }
}
;(async () => {
  let executableSchema = makeExecutableSchema({
    typeDefs: schema,
    resolvers,
  })

  const server = new ApolloServer({
    schema: executableSchema,
    formatError: (err) => {
      const timestamp = new Date().toISOString()
      console.log(`[${timestamp}] Error:`, err)
      return err
    },
  })

  const app = express()

  const limiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 1000,
  })

  app.use(
    cors({
      credentials: true,
      origin: ORIGIN,
    })
  )
  app.use(limiter)
  app.use(express.json({ limit: '50mb' }))

  app.engine('js', createEngine({ transformViews: false }))
  app.set('view engine', 'js')
  app.set('views', path.join(__dirname, 'views'))

  const redisClient = await getRedis()

  app.set('trust proxy', 1) // Enable secure cookies

  const sessionMiddleware: RequestHandler = session({
    store: new RedisStore({
      client: redisClient,
    }),
    secret: COOKIE_SECRET,
    rolling: true,
    resave: false,
    saveUninitialized: true,
    name: 'transitlog-session',
    cookie: {
      secure: SECURE_COOKIE,
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: 'lax',
    },
  })

  app.use('/', sessionMiddleware)

  app.use(checkAccessMiddleware)
  await server.start()

  app.use(
    '/graphql',
    cors({
      credentials: true,
      origin: ORIGIN,
    }),
    express.json({ limit: '50mb' }),
    expressMiddleware(server, {
      context: async ({ req }): Promise<RequestContext> => {
        const skipCache = req.header('x-skip-cache') === 'true'

        return {
          user: getUserFromReq(req),
          skipCache,
          dataSources: createDataSources(),
        }
      },
    })
  )

  app.post('/login', (req, res) => {
    authEndpoints.authorize(req, res)
  })

  app.get('/session', (req, res) => {
    authEndpoints.checkExistingSession(req, res)
  })

  app.get('/logout', (req, res) => {
    authEndpoints.logout(req, res)
  })

  app.get('/hslid-redirect', (req, res) => {
    res.render('ReceiveRedirect', {
      redirectTo: '/admin',
    })
  })

  app.use(express.urlencoded({ extended: true }))

  app.get('/check', async (req, res) => {
    const client = await getRedis()
    const knex = getKnex()

    if (client.status === 'ready' && expressServer.listening && !knex.client.pool.destroyed) {
      res.status(200).send('Ok')
    } else {
      res.status(503).send('Not OK')
    }
  })

  const adminPath = '/admin'
  const adminRouter = await adminController(adminPath)
  app.use(adminPath, requireUserMiddleware(ADMIN_GROUP_NAME), adminRouter)

  const expressServer = app.listen({ port: 4000 }, () =>
    console.log(`🚀 Server ready at http://localhost:4000/graphql`)
  )

  // Set a generous timeout. 1200 seconds is used in Azure and nginx.
  expressServer.setTimeout(1200 * 1000)
})()

cleanup(() => {
  const knex = getKnex()

  if (knex) {
    knex.destroy()
  }

  getRedis().then((client) => client.quit())
})
