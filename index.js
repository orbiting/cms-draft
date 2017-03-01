const express = require('express')
const next = require('next')
const proxy = require('express-http-proxy')

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

  server.use('/gh', proxy('api.github.com', {
    decorateRequest: (proxyReq, originalReq) => {
      proxyReq.headers['Authorization'] = `bearer ${originalReq.session.ghAccessToken}`
      return proxyReq
    },
    https: true
  }))

  server.use(handler)

  server.listen(EXPRESS_PORT, (err) => {
    if (err) throw err
    console.log(`> Ready on port ${EXPRESS_PORT}`)
  })
})
