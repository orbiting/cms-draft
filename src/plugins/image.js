import React, {Component} from 'react'
import {
  EditorBlock
} from 'draft-js'

import {dirname, join as pathJoin} from 'path'

import gql from 'graphql-tag'
import {graphql} from 'react-apollo'

import {
  addNewBlock
} from '../utils/draft'

import md5 from 'blueimp-md5'

const addImage = (editorState, url) => {
  return addNewBlock(editorState, 'atomic', {
    src: url
  })
}

const readFile = (file) => {
  return new Promise((resolve, reject) => {
    const fileReader = new window.FileReader()
    fileReader.addEventListener('load', (event) => {
      let content = event.target.result
      // Strip out the information about the mime type of the file and the encoding
      // at the beginning of the file (e.g. data:image/gif;base64,).
      content = content.replace(/^(.+,)/, '')
      resolve({
        filename: file.name,
        content: content
      })
    })

    fileReader.addEventListener('error', (error) => {
      reject(error)
    })

    fileReader.readAsDataURL(file)
  })
}

class ImageButton extends Component {
  onChange (e) {
    const file = e.target.files[0]
    if (file.type.indexOf('image/') === 0) {
      const {
        owner, repo, branch,
        basePath
      } = this.props
      readFile(file).then(({content, filename}) => {
        this.props.commitFile({
          variables: {
            owner,
            repo,
            branch,
            path: pathJoin(basePath, `images/${md5(content)}-${filename}`),
            content,
            message: `Upload ${filename}`,
            encode: false
          }
        }).then(({data}) => {
          this.props.setEditorState(addImage(
            this.props.getEditorState(),
            `./images/${data.commitFile.name}`
          ))
        })
      })
    }
  }
  render () {
    return (
      <div onMouseDown={event => event.preventDefault()}>
        <button
          onClick={() => {
            this.input.value = null
            this.input.click()
          }}
          type='button'
          children={'Bild hochladen'}
        />
        <input
          type='file'
          accept='image/*'
          ref={input => { this.input = input }}
          onChange={event => this.onChange(event)}
          style={{ display: 'none' }}
        />
      </div>
    )
  }
}

const commitFile = gql`
  mutation commitFile($owner: String!, $repo: String!, $branch: String!, $path: String!, $content: String!, $message: String!, $encode: Boolean) {
    commitFile(owner: $owner, repo: $repo, branch: $branch, path: $path, content: $content, message: $message, encode: $encode) {
      name
    }
  }
`
const ImageButtonWithMutation = graphql(commitFile, {name: 'commitFile'})(ImageButton)

const query = gql`
query get($owner: String!, $repo: String!, $branch: String!, $path: String!) {
  ref(owner: $owner, repo: $repo, branch: $branch) {
    contents(path: $path) {
      download_url
    }
  }
}
`

const Image = ({className, src}) => (
  <img
    src={src}
    role='presentation'
    className={className}
    style={{maxWidth: '100%'}} />
)

const ImageWithQuery = graphql(query, {
  props: ({data}) => {
    const src = data.ref && data.ref.contents && data.ref.contents.length
      ? data.ref.contents[0].download_url
      : undefined

    return {
      loading: data.loading,
      error: data.error,
      src
    }
  }
})(Image)

const ImageBlock = (props) => {
  const {
    block,
    className,
    blockProps: {owner, repo, branch, basePath}
  } = props

  const {src} = block.getData().toJS()

  if (!src) {
    return <EditorBlock {...props} />
  }

  return (
    <div>
      <ImageWithQuery
        className={className}
        owner={owner}
        repo={repo}
        branch={branch}
        path={pathJoin(basePath, src)} />
      <EditorBlock {...props} />
    </div>
  )
}

export default (config = {}) => {
  const props = {
    owner: config.owner,
    repo: config.repo,
    branch: config.branch,
    basePath: config.path ? dirname(config.path) : ''
  }
  return {
    blockRendererFn: (block) => {
      if (block.getType() === 'atomic') {
        return {
          component: ImageBlock,
          editable: true,
          props
        }
      }

      return null
    },
    addImage,
    ImageButton: buttonProps => (
      <ImageButtonWithMutation {...buttonProps} {...props} />
    )
  }
}
