import moment from 'moment-timezone'
import { TZ } from './constants'
// Set the default timezone for the app
moment.tz.setDefault(TZ)

import schema from './schema'
import { ApolloServer } from 'apollo-server'
import { resolvers } from './resolvers/'
import { JoreDataSource } from './datasources/JoreDataSource'
import { HFPDataSource } from './datasources/HFPDataSource'
import { ExceptionDataSource } from './datasources/ExceptionDataSource'

const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
  dataSources: () => ({
    JoreAPI: new JoreDataSource(),
    HFPAPI: new HFPDataSource(),
    ExceptionAPI: new ExceptionDataSource(),
  }),
})

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`)
})
