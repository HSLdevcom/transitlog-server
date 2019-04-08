import moment from 'moment-timezone'
import express from 'express'
import session from 'express-session'
import cors from 'cors'
import { json } from 'body-parser'
import { TZ } from './constants'
// Set the default timezone for the app
moment.tz.setDefault(TZ)

import schema from './schema'
import { ApolloServer } from 'apollo-server-express'
import { resolvers } from './resolvers/'
import { JoreDataSource } from './datasources/JoreDataSource'
import { HFPDataSource } from './datasources/HFPDataSource'
import { ExceptionDataSource } from './datasources/ExceptionDataSource'
import authEndpoints from './auth/authEndpoints'

const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
  dataSources: () => ({
    JoreAPI: new JoreDataSource(),
    HFPAPI: new HFPDataSource(),
    ExceptionAPI: new ExceptionDataSource(),
  }),
})

const app = express()

app.use(
  cors({
    credentials: true,
    origin: 'http://localhost:3000',
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
      secure: false, // TODO: set true when on https
      maxAge: 3600000, // ms
      sameSite: true, // Needed for keeping session as the same when receiving new requests
    },
  })
)

server.applyMiddleware({ app })

app.post('/login', function(req, res) {
  authEndpoints.authorize(req, res)
})

app.get('/existingSession', function(req, res) {
  authEndpoints.checkExistingSession(req, res)
})

app.get('/logout', function(req, res) {
  authEndpoints.logout(req, res)
})

app.listen({ port: 4000 }, () =>
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
)
