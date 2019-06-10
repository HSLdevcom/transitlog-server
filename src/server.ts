import moment from 'moment-timezone'
import express from 'express'
import cors from 'cors'
import { json } from 'body-parser'
import { TZ } from './constants'
// Set the default timezone for the app
moment.tz.setDefault(TZ)

import { types } from 'pg'
types.setTypeParser(1082, (val) => val)

import schema from './schema'
import { ApolloServer } from 'apollo-server-express'
import { resolvers } from './resolvers/'
import { JoreDataSource } from './datasources/JoreDataSource'
import { HFPDataSource } from './datasources/HFPDataSource'
import authEndpoints from './auth/authEndpoints'
import { checkAccessMiddleware } from './auth/authService'
import { getRedis } from './app/cache'
import path from 'path'
import { createEngine } from 'express-react-views'
import { getUserFromReq, requireUserMiddleware } from './auth/requireUser'

const session = require('express-session')
const RedisSession = require('connect-redis')(session)

const ORIGIN = process.env.REDIRECT_URI
const SECURE_COOKIE = process.env.SECURE_COOKIE === 'true'

type User = {
  email: string
  groups: string[]
  accessToken: string
}

type UserContext = {
  user: null | User
}
;(async () => {
  const server = new ApolloServer({
    typeDefs: schema,
    resolvers,
    dataSources: () => ({
      JoreAPI: new JoreDataSource(),
      HFPAPI: new HFPDataSource(),
    }),
    context: ({ req }): UserContext => {
      return { user: getUserFromReq(req) }
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

  app.engine('jsx', createEngine())
  app.set('view engine', 'jsx')

  app.set('views', path.join(__dirname, 'views'))

  const redisClient = await getRedis()

  app.use(
    session({
      store: new RedisSession({
        client: redisClient,
      }),
      secret: 'very-much-secret',
      rolling: true,
      resave: false,
      saveUninitialized: true,
      name: 'transitlog-session',
      cookie: {
        secure: false, // TODO: Investigate why true will not work.
        maxAge: 3600000,
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

  app.use(express.urlencoded({ extended: true }))
  app.use(requireUserMiddleware('HSL'))

  app.get('/admin', (req, res) => {
    res.render('admin', {})
  })

  app.listen({ port: 4000 }, () =>
    console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
  )
})()
