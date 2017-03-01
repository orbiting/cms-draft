import React, {Component} from 'react'

import App from '../src/components/App'
import Center from '../src/components/Center'
import List from '../src/components/List'
import withData from '../src/apollo/withData'
import {Router} from '../routes'
import slugify from 'slugify'
import gql from 'graphql-tag'
import {graphql} from 'react-apollo'

slugify.extend({
  'ä': 'ae',
  'ö': 'oe',
  'ü': 'ue'
})

class NewArticle extends Component {
  render () {
    return (
      <label>
        Neuer Artikel<br />
        <input placeholder='Titel' ref={(ref) => { this.ref = ref }} />
        <input type='submit' value='erstellen' onClick={() => {
          const value = this.ref.value
          if (value) {
            const path = `${slugify(value.toLowerCase())}.md`
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

const query = gql`
query index {
  me
}
`

const Index = ({me, loading}) => {
  if (loading) {
    return <span>...</span>
  }
  if (me) {
    return (
      <div>
        <h1>Artikel</h1>
        <List />
        <NewArticle />
      </div>
    )
  }
  return <Login />
}

const IndexWithQuery = graphql(query, {
  props: ({data}) => {
    return {
      loading: data.loading,
      error: data.error,
      me: data.me
    }
  }
})(Index)

export default withData((props) => (
  <App>
    <Center>
      <IndexWithQuery />
    </Center>
  </App>
))
