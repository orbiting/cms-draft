const GitHub = require('github-api')
const {GH_OWNER, GH_REPO} = require('../constants')

const DEFAULT_BRANCH = 'test'

const resolveFunctions = {
  Mutation: {
    commitFile (_, {owner = GH_OWNER, repo = GH_REPO, branch = DEFAULT_BRANCH, path, content, message, encode = true}, {session: {ghAccessToken}}) {
      const gh = new GitHub({
        token: ghAccessToken
      })
      const ghRepo = gh
        .getRepo(owner, repo)

      return ghRepo.writeFile(
        branch,
        path,
        content,
        message,
        {encode}
      ).then(({data}) => data.content)
    }
  },
  RootQuery: {
    ref (_, {owner = GH_OWNER, repo = GH_REPO, branch = DEFAULT_BRANCH}, {session: {ghAccessToken}}) {
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
          return data
        })
    }
  }
}

module.exports = resolveFunctions
