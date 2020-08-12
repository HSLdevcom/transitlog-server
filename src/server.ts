import moment from 'moment-timezone'
import express from 'express'
import cors from 'cors'
import { json } from 'body-parser'
import { COOKIE_SECRET, HSL_GROUP_NAME, SECURE_COOKIE, TZ } from './constants'
import { types } from 'pg'
import schema from './schema'
import { ApolloServer, makeExecutableSchema } from 'apollo-server-express'
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
import { databases, getKnex } from './knex'
// Set the default timezone for the app
moment.tz.setDefault(TZ)

types.setTypeParser(1082, (val) => val)

const session = require('express-session')
const RedisSession = require('connect-redis')(session)

const ORIGIN = process.env.REDIRECT_URI

type User = {
  email: string
  groups: string[]
  accessToken: string
}

type RequestContext = {
  user: null | User
  skipCache: boolean
}
;(async () => {
  let executableSchema = makeExecutableSchema({
    typeDefs: schema,
    resolvers,
  })

  const server = new ApolloServer({
    schema: executableSchema,
    formatError: (err) => {
      console.log(err)
      return err
    },
    dataSources: () => ({
      JoreAPI: new JoreDataSource(),
      HFPAPI: new HFPDataSource(),
    }),
    context: ({ req }): RequestContext => {
      const skipCache = req.header('x-skip-cache') === 'true'
      return { user: getUserFromReq(req), skipCache }
    },
  })

  const app = express()

  app.use(
    cors({
      credentials: true,
      origin: ORIGIN,
    })
  )

  app.use(json({ limit: '50mb' }))

  app.engine('js', createEngine({ transformViews: false }))
  app.set('view engine', 'js')
  app.set('views', path.join(__dirname, 'views'))

  const redisClient = await getRedis()

  app.set('trust proxy', 1) // Enable secure cookies

  app.use(
    session({
      store: new RedisSession({
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
        httpOnly: false,
      },
    })
  )

  app.use(checkAccessMiddleware)
  server.applyMiddleware({ app, cors: { credentials: true, origin: ORIGIN } })

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
    const knex = getKnex(databases.HFP)

    if (client.status === 'ready' && expressServer.listening && !knex.client.pool.destroyed) {
      res.status(200).send('Ok')
    } else {
      res.status(503).send('Not OK')
    }
  })

  const adminPath = '/admin'
  const adminRouter = await adminController(adminPath)
  app.use(adminPath, requireUserMiddleware(HSL_GROUP_NAME), adminRouter)

  const expressServer = app.listen({ port: 4000 }, () =>
    console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
  )

  // Set a generous timeout. 1200 seconds is used in Azure and nginx.
  expressServer.setTimeout(1200 * 1000)
})()

cleanup(() => {
  const knexJore = getKnex(databases.JORE)
  const knexHFP = getKnex(databases.HFP)

  if (knexJore) {
    knexJore.destroy()
  }

  if (knexHFP) {
    knexHFP.destroy()
  }

  getRedis().then((client) => client.quit())
})
