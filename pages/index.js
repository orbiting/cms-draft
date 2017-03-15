import React, {Component} from 'react'

import App from '../src/components/App'
import Center from '../src/components/Center'
import ArticleList from '../src/components/List'
import Me, {withMe} from '../src/components/Me'
import withData from '../src/apollo/withData'
import {Router} from '../routes'
import slug from '../src/utils/slug'

class NewArticle extends Component {
  render () {
    return (
      <label>
        Neuer Artikel<br />
        <input placeholder='Titel' ref={(ref) => { this.ref = ref }} />
        <input type='submit' value='erstellen' onClick={() => {
          const value = this.ref.value
          if (value) {
            const path = `${slug(value)}.md`
            Router.push(
              `/editor?path=${path}&title=${encodeURIComponent(value)}`,
              `/${path}/edit`
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

const Index = ({me, loading}) => {
  if (loading) {
    return <span>...</span>
  }
  if (me) {
    return (
      <div>
        <h1><Me /></h1>
        <h2>Artikel</h2>
        <ArticleList />
        <NewArticle />
      </div>
    )
  }
  return <Login />
}

const IndexWithMe = withMe(Index)

export default withData((props) => (
  <App>
    <Center>
      <IndexWithMe />
    </Center>
  </App>
))
