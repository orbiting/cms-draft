import React from 'react'

import gql from 'graphql-tag'
import {graphql} from 'react-apollo'

const query = gql`
query list {
  me {
    repos {
      full_name
      private
      default_branch
      permissions {
        push
      }
    }
  }
}
`

const List = ({entries, value, onChange}) => (
  <select value={value} onChange={onChange}>
    <option value=''>Repository auswählen</option>
    {entries.map((entry, i) => (
      <option key={i} value={`${entry.full_name}/${entry.default_branch}`}>
        {entry.full_name}
        {entry.private ? ' 🔑' : ''}
        {!entry.permissions.push ? ' 👀' : ''}
      </option>
    ))}
  </select>
)

const ListWithQuery = graphql(query, {
  props: ({data}) => {
    const entries = data.me
      ? data.me.repos
      : []

    return {
      loading: data.loading,
      error: data.error,
      entries: entries
    }
  }
})(List)

export default ListWithQuery
