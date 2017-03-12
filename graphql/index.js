const express = require('express')
const bodyParser = require('body-parser')
const {graphqlExpress, graphiqlExpress} = require('graphql-server-express')
const {makeExecutableSchema} = require('graphql-tools')

const Schema = require('./schema')
const Resolvers = require('./resolvers')
const auth = require('./auth')

const executableSchema = makeExecutableSchema({
  typeDefs: Schema,
  resolvers: Resolvers
})

const server = express()

server.use(auth)

server.use(
  '/graphql',
  bodyParser.json({limit: '10mb'}),
  graphqlExpress(request => ({
    schema: executableSchema,
    context: {
      session: request.session
    }
  }))
)

server.use('/graphiql', graphiqlExpress({
  endpointURL: '/graphql'
}))

module.exports = server
