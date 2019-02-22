import schema from './schema'
import { ApolloServer } from 'apollo-server'
import { resolvers } from './resolvers/'
import { createApp } from './app/app'
import { RedisCache } from 'apollo-server-cache-redis'

const server = new ApolloServer({
  typeDefs: schema,
  resolvers: resolvers,
  cache: new RedisCache({
    host: '0.0.0.0',
  }),
  context: async () => ({
    app: await createApp(),
  }),
})

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`)
})
