const express = require('express')
const next = require('next')
const proxy = require('express-http-proxy')

const {EXPRESS_PORT} = require('./constants')

const routes = require('./routes')

const DEV = process.env.NODE_ENV !== 'production'

if (DEV) {
  require('dotenv').config()
}

const app = next({dir: '.', dev: DEV})
const handler = routes.getRequestHandler(app)

app.prepare().then(() => {
  const server = express()

  server.use('/gh', proxy('api.github.com', {
    decorateRequest: (proxyReq, originalReq) => {
      proxyReq.headers['Authorization'] = `bearer ${process.env.GITHUB_TOKEN}`
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
