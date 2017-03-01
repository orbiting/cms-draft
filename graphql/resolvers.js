const GitHub = require('github-api')
const {GH_OWNER, GH_REPO} = require('../constants')

const resolveFunctions = {
  RootQuery: {
    ref (_, {owner = GH_OWNER, repo = GH_REPO, branch = 'test'}, {session: {ghAccessToken}}) {
      const gh = new GitHub({
        token: ghAccessToken
      })
      const ghRepo = gh
        .getRepo(owner, repo)

      return {
        contents ({path}) {
          return ghRepo.getSha(branch, path)
            .then(({data}) => {
              return [].concat(data)
            })
            .catch((error) => {
              if (error.response && error.response.status === 404) {
                return []
              }
              throw error
            })
        }
      }
    },
    me (_, params, {session: {ghAccessToken}}) {
      if (!ghAccessToken) {
        return null
      }
      const gh = new GitHub({
        token: ghAccessToken
      })

      return gh.getUser()
        .getProfile()
        .then(({data}) => {
          return data.name || data.login
        })
    }
  }
}

module.exports = resolveFunctions
