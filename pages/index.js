import React, {Component} from 'react'

import App from '../src/components/App'
import Center from '../src/components/Center'
import RepoSelect from '../src/components/RepoSelect'
import FileList from '../src/components/FileList'
import Me, {withMe} from '../src/components/Me'
import withData from '../src/apollo/withData'
import {Router} from '../routes'
import slug from '../src/utils/slug'
import {join as pathJoin} from 'path'

class NewArticle extends Component {
  render () {
    const {owner, repo, branch, path} = this.props
    return (
      <label>
        Neuer Artikel<br />
        <input placeholder='Titel' ref={(ref) => { this.ref = ref }} />
        <input type='submit' value='erstellen' onClick={() => {
          const value = this.ref.value
          if (value) {
            const filePath = pathJoin(path, `${slug(value)}.md`)
            Router.push(
              `/editor?${[
                `owner=${encodeURIComponent(owner)}`,
                `repo=${encodeURIComponent(repo)}`,
                `branch=${encodeURIComponent(branch)}`,
                `path=${encodeURIComponent(filePath)}`
              ].join('&')}&title=${encodeURIComponent(value)}`,
              `/${[owner, repo, branch, filePath].join('/')}/edit`
            )
          }
        }} />
      </label>
    )
  }
}

const Login = () => (
  <div>
    <h1>Login</h1>
    <p>
      <a href='/auth/login'>Jetzt mit GitHub einloggen.</a>
    </p>
  </div>
)

const Index = ({me, loading, url: {query}}) => {
  if (loading) {
    return <span>...</span>
  }
  if (me) {
    const params = {
      path: '',
      ...query
    }

    return (
      <div>
        <h1><Me /></h1>
        <RepoSelect
          value={(query.repo
            ? [query.owner, query.repo, query.branch].join('/')
            : ''
          )}
          onChange={(event) => {
            if (!event.target.value) {
              Router.push('/')
              return
            }
            const [owner, repo, branch] = event.target.value.split('/')
            Router.push(`/?${[
              `owner=${owner}`,
              `repo=${repo}`,
              `branch=${branch}`
            ].join('&')}`)
          }} />
        {!!query.repo && (
          <div>
            <FileList {...params} />
            <NewArticle {...params} />
          </div>
        )}
      </div>
    )
  }
  return <Login />
}

const IndexWithMe = withMe(Index)

export default withData(({url}) => (
  <App>
    <Center>
      <IndexWithMe url={url} />
    </Center>
  </App>
))
