const express = require('express')
const session = require('express-session')
const queryString = require('query-string')
const fetch = require('isomorphic-fetch')
const crypto = require('crypto')
const {DEV, EXPRESS_PORT} = require('../constants')

const server = express()

server.enable('trust proxy')
server.disable('x-powered-by')

server.use(session({
  cookie: {
    path: '/',
    httpOnly: true,
    secure: !DEV,
    maxAge: null
  },
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}))

server.get('/auth/callback', (request, response) => {
  if (request.query.state !== request.session.githubState) {
    response.status(404).send('Not found')
    return
  }
  if (request.query.error) {
    response.status(500).json({
      error: request.query.error,
      error_description: request.query.error_description,
      error_uri: request.query.error_uri
    })
    return
  }
  const parameters = {
    client_id: process.env.GITHUB_CLIENT_ID,
    client_secret: process.env.GITHUB_CLIENT_SECRET,
    code: request.query.code,
    state: request.session.githubState
  }
  fetch(
    `https://github.com/login/oauth/access_token?${queryString.stringify(parameters)}`,
    {method: 'POST', headers: {'Accept': 'application/json'}}
  )
    .then((response) => response.json().then(
      (data) => ({response, data}),
      (error) => {
        throw new Error(`Failed to parse JSON, ${error}`)
      }
    ))
    .then((result) => {
      if (result.response.ok) {
        const callbackPath = request.session.callbackPath

        request.session.ghAccessToken = result.data.access_token
        request.session.ghScope = result.data.scope

        response
          .status(302)
          .set(
            'Location',
            `${request.protocol}://${request.hostname}${DEV ? `:${EXPRESS_PORT}` : ''}/${callbackPath || ''}`
          )
          .end()
      } else {
        response.status(result.response.status).json(result.data)
      }
    })
    .catch((error) => {
      response.status(500).json({
        error: error.toString()
      })
    })
})

server.get('/auth/login', (request, response) => {
  const state = crypto.randomBytes(64).toString('hex')
  const parameters = {
    client_id: process.env.GITHUB_CLIENT_ID,
    state: state,
    scope: 'repo',
    redirect_uri: `${request.protocol}://${request.hostname}${DEV ? `:${EXPRESS_PORT}` : ''}/auth/callback`
  }

  request.session.callbackPath = request.query.callbackPath
  request.session.githubState = state

  response
    .status(302)
    .set('Location', `https://github.com/login/oauth/authorize?${queryString.stringify(parameters)}`)
    .end()
})

module.exports = server
