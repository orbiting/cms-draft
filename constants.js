exports.EXPRESS_PORT = typeof process !== 'undefined' && process.env.PORT || 3000

const location = typeof window !== 'undefined' && window.location
const hostname = location ? location.hostname : '127.0.0.1'
const port = location ? location.port : exports.EXPRESS_PORT
const protocol = location ? location.protocol : 'http:'

const SELF_BASE = exports.SELF_BASE = `${protocol}//${hostname}${port ? `:${port}` : ''}`
exports.GH_API_BASE = `${SELF_BASE}/gh`
exports.GRAPHQL_URI = `${SELF_BASE}/graphql`

exports.GH_OWNER = 'tpreusse'
exports.GH_REPO = 'cms-draft'
