const nextRoutes = require('next-routes')
const routes = module.exports = nextRoutes()

routes.add('index', '/')
routes.add('editor', '/:owner/:repo/:branch/:path/edit')
