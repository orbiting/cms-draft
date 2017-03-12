exports.EXPRESS_PORT = typeof process !== 'undefined' && process.env.PORT || 3000
exports.DEV = process.env.NODE_ENV !== 'production'

const location = typeof window !== 'undefined' && window.location
const host = location ? location.hostname : '127.0.0.1'
const port = location ? location.port : exports.EXPRESS_PORT
const protocol = location ? location.protocol : 'http:'

const BASE_URL = `${protocol}//${host}${port ? `:${port}` : ''}`
exports.GRAPHQL_URI = `${BASE_URL}/graphql`

exports.GH_OWNER = 'tpreusse'
exports.GH_REPO = 'cms-draft'
