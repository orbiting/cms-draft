const express = require('express')
const next = require('next')

const {EXPRESS_PORT, DEV} = require('./constants')

const routes = require('./routes')

if (DEV) {
  require('dotenv').config()
}

const app = next({dir: '.', dev: DEV})
const handler = routes.getRequestHandler(app)

app.prepare().then(() => {
  const server = express()

  server.use(require('./graphql'))

  server.use(handler)

  server.listen(EXPRESS_PORT, (err) => {
    if (err) throw err
    console.log(`> Ready on port ${EXPRESS_PORT}`)
  })
})
