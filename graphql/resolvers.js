const GitHub = require('github-api')
const {GH_OWNER, GH_REPO} = require('../constants')

const gh = new GitHub({
  token: process.env.GITHUB_TOKEN
})

const resolveFunctions = {
  RootQuery: {
    ref (_, {owner = GH_OWNER, repo = GH_REPO, branch = 'test'}) {
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
    }
  }
}

module.exports = resolveFunctions
