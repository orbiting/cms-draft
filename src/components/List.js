import React from 'react'

import gql from 'graphql-tag'
import {graphql} from 'react-apollo'
import {Link} from '../../routes'

const query = gql`
query list {
  ref {
    contents(path: "content") {
      name
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
    const entries = data.ref
      ? data.ref.contents
      : []

    return {
      loading: data.loading,
      error: data.error,
      entries: entries.filter(entry => entry.name.match(/\.md$/))
    }
  }
})(List)

export default ListWithQuery
