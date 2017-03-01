import React, {Component} from 'react'
import withData from '../src/apollo/withData'
import App from '../src/components/App'
import Head from 'next/head'
import {Base64} from 'js-base64'
import {timeFormat} from 'd3-time-format'
import CustomImageSideButton from '../src/components/ImageButton'
import {repo} from '../src/api/github'
import {convertMdToDraft, convertDraftToMd} from '../src/utils/markdown'
import customRendererFn from '../src/utils/renderer'
import {safeLoad, safeDump} from 'js-yaml'
import {basename} from 'path'

import gql from 'graphql-tag'
import {graphql} from 'react-apollo'

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

const metaLabels = {
  title: 'Titel',
  author: 'Autor'
}

class EditorWithState extends Component {
  constructor (props) {
    super(props)

    let content = props.content
    let meta = {
      title: basename(props.path, '.md'),
      author: ''
    }
    const separator = /^---\s*/
    const lines = content.split('\n')
    if (lines[0].match(separator)) {
      const end = lines.findIndex((line, i) => i > 0 && line.match(separator))
      meta = safeLoad(lines.slice(1, end).join('\n'))
      content = lines.slice(end + 1).join('\n')
    }

    this.state = {
      editorState: createEditorState(
        content.trim() && convertMdToDraft(content)
      ),
      meta,
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
      const md = convertDraftToMd(
        convertToRaw(this.state.editorState.getCurrentContent()),
      )
      const meta = [
        '---\n',
        safeDump(this.state.meta),
        '---\n\n'
      ].join('')
      // console.log(convertToRaw(this.state.editorState.getCurrentContent()))
      // console.log(md)
      // return

      repo
        .writeFile(
          'test',
          this.props.path,
          `${meta}${md}`,
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
    const {path} = this.props
    const {editorState, messages, meta} = this.state
    return (
      <div className='container'>
        <main>
          <content>
            <Editor
              ref='editor'
              editorState={editorState}
              onChange={this.onChange}
              sideButtons={sideButtons}
              rendererFn={customRendererFn(path)} />
          </content>
        </main>
        <div className='sidebar'>
          <content>
            <h2>Meta Daten</h2>
            {
              Object.keys(meta).map(key => (
                <p key={key}>
                  <label>
                    {metaLabels[key] || key}<br />
                    <input value={meta[key]} onChange={(event) => this.setState({
                      meta: {
                        ...meta,
                        [key]: event.target.value
                      }
                    })} />
                  </label>
                </p>
              ))
            }
            <h2>Speichern</h2>
            <ul>
              {messages.map((message, i) => <li key={i}>{message}</li>)}
            </ul>
            <button onClick={this.save}>Speichern</button>
          </content>
        </div>
        <style jsx>{`
          .container {
            position: relative;
            padding-right: 300px;
            min-height: 100vh;
          }
          content {
            display: block;
            padding: 20px;
          }
          main {
            width: 80%;
          }
          .container content {
            maxWidth: 640px;
          }
          .sidebar {
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            width: 300px;
            background-color: #f6f6f6;
          }
        `}</style>
      </div>
    )
  }
}

const query = gql`
query get($path: String!) {
  ref {
    contents(path: $path) {
      content
      path
    }
  }
}
`

const EditorPage = ({loading, content, path}) => (
  <App>
    <Head>
      <link rel='stylesheet' href='https://unpkg.com/medium-draft/dist/medium-draft.css' />
      <link rel='stylesheet' href='https://maxcdn.bootstrapcdn.com/font-awesome/4.6.1/css/font-awesome.min.css' />
    </Head>
    {!loading && <EditorWithState
      path={path}
      content={content} />}
  </App>
)

const EditorWithQuery = graphql(query, {
  options: ({url, url: {query: {path}}}) => {
    return {
      variables: {
        path: `content/${path}`
      }
    }
  },
  props: ({data, ownProps: {url, url: {query: {path}}}}) => {
    const content = data.ref
      ? data.ref.contents[0].content
      : undefined

    return {
      loading: data.loading,
      error: data.error,
      content: content ? Base64.decode(content) : '',
      path: `content/${path}`
    }
  }
})(EditorPage)

export default withData(EditorWithQuery)
