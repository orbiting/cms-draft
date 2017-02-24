import React from 'react'

import gql from 'graphql-tag'
import {graphql} from 'react-apollo'
import {GH_OWNER, GH_REPO} from '../../constants'
import {Link} from '../../routes'

const query = gql`
query list {
  repository(owner: "${GH_OWNER}", name: "${GH_REPO}") {
    ref(qualifiedName: "refs/heads/test") {
      prefix
      name
      target {
        __typename
        id
        oid
        ... on Commit {
          tree {
            entries {
              mode
              name
              oid
              type
              object {
                ... on Tree {
                  entries {
                    name
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
`

const List = ({entries}) => (
  <ul>
    {entries.map((entry, i) => (
      <li key={i}>
        <Link route='editor' params={{path: entry.name}}>
          <a>{entry.name}</a>
        </Link>
      </li>
    ))}
  </ul>
)

const ListWithQuery = graphql(query, {
  props: ({data}) => {
    const entries = data.repository
      ? data.repository.ref.target.tree.entries
      : []
    const content = entries.find(entry => entry.name === 'content')
    const contentEntries = content
      ? content.object.entries
      : []

    return {
      loading: data.loading,
      error: data.error,
      entries: contentEntries
    }
  }
})(List)

export default ListWithQuery
