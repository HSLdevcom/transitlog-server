import moment from 'moment-timezone'
import express from 'express'
import session from 'express-session'
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

const ORIGIN = process.env.REDIRECT_URI
const SECURE_COOKIE = process.env.SECURE_COOKIE === 'true'

const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
  dataSources: () => ({
    JoreAPI: new JoreDataSource(),
    HFPAPI: new HFPDataSource(),
  }),
  context: ({ req }) => {
    const { email = '', groups = [], accessToken = '' } = req.session || {}
    return { user: { email, groups, accessToken } }
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
app.use(
  session({
    secret: 'very-much-secret',
    rolling: true,
    resave: true,
    saveUninitialized: true,
    cookie: {
      secure: SECURE_COOKIE, // TODO: set true when on https
      maxAge: 3600000,
      sameSite: true,
    },
  })
)

app.use(checkAccessMiddleware)
server.applyMiddleware({ app, cors: { credentials: true, origin: ORIGIN } })

app.post('/login', function(req, res) {
  authEndpoints.authorize(req, res)
})

app.get('/session', function(req, res) {
  authEndpoints.checkExistingSession(req, res)
})

app.get('/logout', function(req, res) {
  authEndpoints.logout(req, res)
})

app.listen({ port: 4000 }, () =>
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
)
