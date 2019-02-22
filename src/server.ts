import schema from './schema'
import { ApolloServer } from 'apollo-server'
import { resolvers } from './resolvers/'
import { createApp } from './app/app'

const app = createApp()
const server = new ApolloServer({ typeDefs: schema, resolvers: resolvers(app) })

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`)
})
