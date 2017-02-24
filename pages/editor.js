import React, {Component} from 'react'
import withData from '../src/apollo/withData'
import App from '../src/components/App'
import Head from 'next/head'
import {GH_API_BASE, GH_OWNER, GH_REPO} from '../constants'
import GitHub from 'github-api'
import {Base64} from 'js-base64'

import {
  Editor,
  createEditorState
} from 'medium-draft'
import {
  convertToRaw
} from 'draft-js'

const ghRepo = new GitHub({}, GH_API_BASE)
  .getRepo(GH_OWNER, GH_REPO)

class EditorWithState extends Component {
  constructor (props) {
    super(props)

    this.state = {
      editorState: createEditorState(props.content)
    }

    this.onChange = (editorState) => {
      this.setState({editorState})
    }
    this.save = () => {
      const json = JSON.stringify(
        convertToRaw(
          this.state.editorState.getCurrentContent()
        ),
        null,
        2
      )
      ghRepo
        .writeFile(
          'test',
          'content/test.json',
          json,
          'Test Save',
          {},
          (error, data) => {
            if (error) {
              console.error(error)
            } else {
              console.log(data)
            }
          }
        )
    }
  }

  componentDidMount () {
    this.refs.editor.focus()
  }

  render () {
    const {content} = this.props
    const {editorState} = this.state
    return (
      <div>
        <div>
          <button onClick={this.save}>Speichern</button>
        </div>
        <Editor
          ref='editor'
          editorState={editorState}
          onChange={this.onChange} />
      </div>
    )
  }
}

class EditorWithContent extends Component {
  static async getInitialProps () {
    return ghRepo
      .getSha('test', 'content/test.json')
        .then(
          ({data}) => {
            return {
              content: JSON.parse(
                Base64.decode(data.content)
              )
            }
          }
        )
        .catch((error) => {
          console.error(error)
          return {error}
        })
  }
  render () {
    const {content} = this.props
    return (
      <App>
        <Head>
          <link rel='stylesheet' href='https://unpkg.com/medium-draft/dist/medium-draft.css' />
          <link rel='stylesheet' href='https://maxcdn.bootstrapcdn.com/font-awesome/4.6.1/css/font-awesome.min.css' />
        </Head>
        <EditorWithState content={content} />
      </App>
    )
  }
}

export default withData(EditorWithContent)
