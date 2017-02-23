exports.EXPRESS_PORT = typeof process !== 'undefined' && process.env.PORT || 3000

const location = typeof window !== 'undefined' && window.location
const hostname = location ? location.hostname : '127.0.0.1'
const port = location ? location.port : exports.EXPRESS_PORT
const protocol = location ? location.protocol : 'http:'
exports.GRAPHQL_URI = `${protocol}//${hostname}${port ? `:${port}` : ''}/gh/graphql`
