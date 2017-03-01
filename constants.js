exports.EXPRESS_PORT = typeof process !== 'undefined' && process.env.PORT || 3000

const location = typeof window !== 'undefined' && window.location
const hostname = location ? location.hostname : 'localhost'
const address = location ? location.hostname : '127.0.0.1'
const port = location ? location.port : exports.EXPRESS_PORT
const protocol = location ? location.protocol : 'http:'

const BASE_URL_ADDRESS = `${protocol}//${address}${port ? `:${port}` : ''}`
const BASE_URL = exports.BASE_URL = `${protocol}//${hostname}${port ? `:${port}` : ''}`
exports.GH_API_BASE = `${BASE_URL}/gh`
exports.GRAPHQL_URI = `${BASE_URL_ADDRESS}/graphql`

exports.GH_OWNER = 'tpreusse'
exports.GH_REPO = 'cms-draft'

exports.DEV = process.env.NODE_ENV !== 'production'
