import React, {Component} from 'react'
import Head from 'next/head'
import {Base64} from 'js-base64'
import {timeFormat} from 'd3-time-format'
import {repo} from '../src/api/github'
import {convertMdToDraft, convertDraftToMd} from '../src/utils/markdown'
import {safeLoad, safeDump} from 'js-yaml'
import {basename} from 'path'
import {Link, Router} from '../routes'
import initLocalStore from '../src/utils/localstorage'

import withData from '../src/apollo/withData'
import App from '../src/components/App'
import Me, {withMe} from '../src/components/Me'

import gql from 'graphql-tag'
import {graphql} from 'react-apollo'

import {
  convertFromRaw,
  convertToRaw,
  EditorState
} from 'draft-js'

import Editor from 'draft-js-plugins-editor'
import createImagePlugin from '../src/plugins/image'
import createBlockBreakoutPlugin from 'draft-js-block-breakout-plugin'

import createSideToolbarPlugin from 'draft-js-side-toolbar-plugin'
import BlockTypeSelect from 'draft-js-side-toolbar-plugin/lib/components/BlockTypeSelect'
import {
  HeadlineOneButton,
  HeadlineTwoButton,
  BlockquoteButton,
  CodeBlockButton,
  UnorderedListButton,
  OrderedListButton
} from 'draft-js-buttons'

const formatSaveTime = timeFormat('%H:%M')

const metaLabels = {
  title: 'Titel',
  author: 'Autor'
}

class EditorWithState extends Component {
  constructor (props) {
    super(props)

    const imagePlugin = createImagePlugin({
      path: props.path
    })
    const sideToolbarPlugin = createSideToolbarPlugin({
      structure: [
        ({ getEditorState, setEditorState, theme }) => (
          <BlockTypeSelect
            getEditorState={getEditorState}
            setEditorState={setEditorState}
            theme={theme}
            structure={[
              HeadlineOneButton,
              HeadlineTwoButton,
              UnorderedListButton,
              OrderedListButton,
              BlockquoteButton,
              CodeBlockButton,
              imagePlugin.ImageButton
            ]}
          />
        )
      ]
    })
    const blockBreakoutPlugin = createBlockBreakoutPlugin({
      breakoutBlocks: ['header-one', 'header-two', 'header-three', 'header-four', 'header-five', 'header-six', 'atomic']
    })

    this.SideToolbar = sideToolbarPlugin.SideToolbar
    this.plugins = [
      imagePlugin,
      sideToolbarPlugin,
      blockBreakoutPlugin
    ]

    let content = props.content

    const messages = props.messages || []

    const store = this.store = initLocalStore(props.path)
    if (!store.supported) {
      messages.push(
        'Lokaler Speicher nicht verfügbar'
      )
    } else {
      const localContent = store.get(props.sha)
      if (localContent && localContent !== content) {
        content = localContent
        messages.push(
          'Version wiederhergestellt aus lokalem Speicher'
        )
      }
    }

    let meta = {
      title: props.defaultTitle || '',
      author: ''
    }
    const separator = /^---\s*/
    const lines = content.split('\n')
    if (lines[0].match(separator)) {
      const end = lines.findIndex((line, i) => i > 0 && line.match(separator))
      meta = safeLoad(lines.slice(1, end).join('\n'))
      content = lines.slice(end + 1).join('\n')
    }

    const editorState = content.trim()
      ? EditorState.createWithContent(
          convertFromRaw(
            convertMdToDraft(content)
          )
        )
      : EditorState.createEmpty()

    // console.log(
    //   content.trim() &&
    //   JSON.stringify(convertMdToDraft(content), null, 2),
    //   content
    // )

    this.state = {
      editorState,
      meta,
      messages
    }

    this.onChange = (editorState) => {
      this.setState({editorState})
    }
    this.getMarkdown = () => {
      const md = convertDraftToMd(
        convertToRaw(this.state.editorState.getCurrentContent()),
      )
      const meta = [
        '---\n',
        safeDump(this.state.meta),
        '---\n\n'
      ].join('')

      return `${meta}${md}`
    }
    this.save = () => {
      repo
        .writeFile(
          'test',
          this.props.path,
          this.getMarkdown(),
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
  componentDidUpdate () {
    this.store.set(this.props.sha, this.getMarkdown())
  }

  render () {
    const {editorState, messages, meta} = this.state
    const SideToolbar = this.SideToolbar
    return (
      <div className='container'>
        <main>
          <content>
            <Editor
              ref='editor'
              editorState={editorState}
              onChange={this.onChange}
              plugins={this.plugins} />
            <SideToolbar />
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
            <h3><Me size={16} /></h3>
            <Link route='index'>
              <a>Übersicht</a>
            </Link>
          </content>
        </div>
        <style jsx global>{`
          figure {
            margin: 0;
          }
        `}</style>
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
            box-sizing: border-box;
            padding-left: 90px;
          }
          figure {
            margin: 0;
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
      sha
    }
  }
}
`

const EditorPage = ({loading, content, path, sha, defaultTitle}) => (
  <App>
    <Head>
      <link rel='stylesheet' href='https://unpkg.com/draft-js@0.10.0/dist/Draft.css' />
      <link rel='stylesheet' href='https://unpkg.com/draft-js-side-toolbar-plugin@2.0.0-beta6/lib/plugin.css' />
      <link rel='stylesheet' href='https://maxcdn.bootstrapcdn.com/font-awesome/4.6.1/css/font-awesome.min.css' />
    </Head>
    {!loading && <EditorWithState
      key={path}
      defaultTitle={defaultTitle}
      path={path}
      sha={sha}
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
  props: ({data, ownProps: {url, url: {query: {path, title}}}}) => {
    const file = data.ref
      ? data.ref.contents[0]
      : undefined

    const content = file ? Base64.decode(file.content) : ''

    return {
      loading: data.loading,
      error: data.error,
      content,
      sha: file ? file.sha : '',
      defaultTitle: title || basename(path, '.md'),
      path: `content/${path}`
    }
  }
})(EditorPage)

export default withData(withMe(EditorWithQuery, ({data, ownProps: {serverContext}}) => {
  if (!data.me) {
    if (serverContext) {
      serverContext.res.redirect(302, '/')
      serverContext.res.end()
    } else {
      Router.push('/')
    }
  }
}))
