import { ApolloServer } from 'apollo-server-koa'
import * as Koa from 'koa'
import resolvers from 'graphql/resolvers'
import typeDefs from 'graphql/types'
import { databaseInitializer } from 'initializers/database'

const bootstrap = async () => {
  await databaseInitializer()

  const server = new ApolloServer({ typeDefs, resolvers })
  const app = new Koa()
  server.applyMiddleware({ app })

  app.listen({ port: 2001 }, () => {
    console.log(`🚀 Server ready at http://localhost:2001${server.graphqlPath}`)
  })
}

bootstrap()
