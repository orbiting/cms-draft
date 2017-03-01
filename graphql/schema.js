const ghTypes = `
type Content {
  type: String!
  encoding: String
  size: Int!
  name: String!
  path: String!
  content: String
  sha: String!
  url: String!
  git_url: String!
  html_url: String!
  download_url: String
}
type Ref {
  contents(path: String!): [Content!]!
}
type User {
  login: String!
  id: String!
  avatar_url: String
  gravatar_id: String
  url: String
  html_url: String
  followers_url: String
  following_url: String
  gists_url: String
  starred_url: String
  subscriptions_url: String
  organizations_url: String
  repos_url: String
  events_url: String
  received_events_url: String
  type: String
  site_admin: Boolean
  name: String
  company: String
  blog: String
  location: String
  email: String
  hireable: Boolean
  bio: String
  public_repos: Int
  public_gists: Int
  followers: Int
  following: Int
  created_at: String
  updated_at: String
}
`

const queryDefinitions = `
type RootQuery {
  ref(owner: String, repo: String, branch: String): Ref!
  me: User
}
schema {
  query: RootQuery
}
`

module.exports = [ghTypes, queryDefinitions]
