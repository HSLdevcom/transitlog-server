import schema from './schema'
import { ApolloServer } from 'apollo-server'
import { resolvers } from './resolvers/'
import { JoreDataSource } from './datasources/JoreDataSource'

const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
  dataSources: () => ({
    JoreAPI: new JoreDataSource(),
  }),
})

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`)
})
