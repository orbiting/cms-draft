import React from 'react'

import gql from 'graphql-tag'
import {graphql} from 'react-apollo'

const query = gql`
query list {
  repository(owner: "tpreusse", name: "cms-draft") {
    ref(qualifiedName: "refs/heads/master") {
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
    {entries.map((entry, i) => <li key={i}>{entry.name}</li>)}
  </ul>
)

const ListWithQuery = graphql(query, {
  props: ({data}) => {
    return {
      loading: data.loading,
      error: data.error,
      entries: data.repository
        ? data.repository.ref.target.tree.entries
        : []
    }
  }
})(List)

export default ListWithQuery
