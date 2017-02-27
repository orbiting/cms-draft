import React, {Component} from 'react'
import withData from '../src/apollo/withData'
import App from '../src/components/App'
import Head from 'next/head'
import {Base64} from 'js-base64'
import {stateFromMarkdown} from 'draft-js-import-markdown'
import {stateToMarkdown} from 'draft-js-export-markdown'
import {timeFormat} from 'd3-time-format'
import CustomImageSideButton from '../src/components/ImageButton'
import {repo} from '../src/api/github'

import {
  Editor,
  createEditorState
} from 'medium-draft'
import {
  convertToRaw
} from 'draft-js'

const formatSaveTime = timeFormat('%H:%M')

const sideButtons = [{
  title: 'Image',
  component: CustomImageSideButton
}]

class EditorWithState extends Component {
  constructor (props) {
    super(props)

    const content = props.content

    this.state = {
      editorState: createEditorState(
        content && convertToRaw(stateFromMarkdown(content))
      ),
      messages: props.messages || []
    }

    this.onChange = (editorState) => {
      this.setState({editorState})
    }
    this.save = () => {
      // const json = JSON.stringify(
      //   convertToRaw(
      //     this.state.editorState.getCurrentContent()
      //   ),
      //   null,
      //   2
      // )
      const md = stateToMarkdown(
        this.state.editorState.getCurrentContent()
      )

      repo
        .writeFile(
          'test',
          `content/${this.props.path}`,
          md,
          'Test Save',
          {},
          (error, data) => {
            if (error) {
              this.setState({
                messages: [error.toString()]
              })
            } else {
              this.setState({
                messages: [`Gespeichert ${formatSaveTime(new Date())}`]
              })
            }
          }
        )
    }
  }

  componentDidMount () {
    this.refs.editor.focus()
  }

  render () {
    const {editorState, messages} = this.state
    return (
      <div>
        <div>
          <ul>
            {messages.map((message, i) => <li key={i}>{message}</li>)}
          </ul>
          <button onClick={this.save}>Speichern</button>
        </div>
        <Editor
          ref='editor'
          editorState={editorState}
          onChange={this.onChange}
          sideButtons={sideButtons} />
      </div>
    )
  }
}

class EditorWithContent extends Component {
  static async getInitialProps ({query: {path}}) {
    return repo
      .getSha('test', `content/${path}`)
        .then(({data}) => {
          return {
            content: Base64.decode(data.content),
            path
          }
        })
        .catch((error) => {
          let message = error.toString()
          if (error.response.status === 404) {
            message = 'Neues Dokument'
          }
          return {
            messages: [message],
            path
          }
        })
  }
  render () {
    const {content, path, messages} = this.props
    return (
      <App>
        <Head>
          <link rel='stylesheet' href='https://unpkg.com/medium-draft/dist/medium-draft.css' />
          <link rel='stylesheet' href='https://maxcdn.bootstrapcdn.com/font-awesome/4.6.1/css/font-awesome.min.css' />
        </Head>
        <EditorWithState
          path={path}
          content={content}
          messages={messages} />
      </App>
    )
  }
}

export default withData(EditorWithContent)
