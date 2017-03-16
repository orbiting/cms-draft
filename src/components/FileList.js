import React from 'react'

import gql from 'graphql-tag'
import {graphql} from 'react-apollo'
import {Link} from '../../routes'
import {join as pathJoin} from 'path'
import {intersperse} from '../utils/helpers'

const query = gql`
query list($owner: String!, $repo: String!, $branch: String!, $path: String!) {
  ref(owner: $owner, repo: $repo, branch: $branch) {
    contents(path: $path) {
      type
      name
      path
    }
  }
}
`

const List = ({entries, owner, repo, branch, path}) => {
  const pathSegments = [''].concat(
    path
      .split('/')
      .filter(Boolean)
  )

  return (
    <div>
      <h2>Verzeichnisse</h2>
      <p>
        {intersperse(pathSegments.map((segment, i) => {
          if (i === pathSegments.length - 1) {
            return segment
          }
          return <Link key={i} href={`/?${[
            `owner=${owner}`,
            `repo=${repo}`,
            `branch=${branch}`
          ].join('&')}&path=${pathSegments.slice(0, i)}`}>
            <a>{segment || 'Root'}</a>
          </Link>
        }), ' / ')}
      </p>
      <ul>
        {entries.filter(entry => entry.type === 'dir').map((entry, i) => (
          <li key={i}>
            <Link href={`/?${[
              `owner=${owner}`,
              `repo=${repo}`,
              `branch=${branch}`
            ].join('&')}&path=${entry.path}`}>
              <a>{entry.name}</a>
            </Link>
          </li>
        ))}
      </ul>
      <h2>Artikel</h2>
      <ul>
        {entries.filter(entry => entry.type !== 'dir').map((entry, i) => (
          <li key={i}>
            <Link route='editor' params={{path: pathJoin(path, entry.name), owner, repo, branch}}>
              <a>{entry.name}</a>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

const ListWithQuery = graphql(query, {
  props: ({data}) => {
    const entries = data.ref
      ? data.ref.contents
      : []

    return {
      loading: data.loading,
      error: data.error,
      entries: entries.filter(entry => entry.type === 'dir' || entry.name.match(/\.md$/))
    }
  }
})(List)

export default ListWithQuery
