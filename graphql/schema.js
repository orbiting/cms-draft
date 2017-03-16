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
  url: String
  type: String
  site_admin: Boolean
  name: String
  company: String
  blog: String
  location: String
  email: String
  hireable: Boolean
  bio: String
  repos: [Repo]
  created_at: String
  updated_at: String
}
type Permissions {
  admin: Boolean
  push: Boolean
  pull: Boolean
}
type Repo {
  id: String!
  owner: User!
  name: String!
  full_name: String!
  description: String
  private: Boolean
  fork: Boolean
  url: String
  default_branch: String
  permissions: Permissions
  created_at: String
  updated_at: String
}
`

const definitions = `
type RootQuery {
  ref(owner: String!, repo: String!, branch: String!): Ref!
  me: User
}
type Mutation {
  commitFile (
    owner: String!,
    repo: String!,
    branch: String!,
    path: String!,
    content: String!,
    message: String!,
    encode: Boolean
  ): Content
}
schema {
  query: RootQuery
  mutation: Mutation
}
`

module.exports = [ghTypes, definitions]
