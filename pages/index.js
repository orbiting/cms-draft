import React, {Component} from 'react'

import App from '../src/components/App'
import Center from '../src/components/Center'
import List from '../src/components/List'
import withData from '../src/apollo/withData'
import {Router} from '../routes'
import slugify from 'slugify'

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

export default withData((props) => (
  <App>
    <Center>
      <h1>Artikel</h1>
      <List />
      <NewArticle />
    </Center>
  </App>
))
