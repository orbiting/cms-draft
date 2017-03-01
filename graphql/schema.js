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
`

const queryDefinitions = `
type RootQuery {
  ref(owner: String, repo: String, branch: String): Ref!
}
schema {
  query: RootQuery
}
`

module.exports = [ghTypes, queryDefinitions]
