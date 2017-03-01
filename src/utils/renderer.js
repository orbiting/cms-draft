import {dirname, join as pathJoin} from 'path'

import gql from 'graphql-tag'
import {graphql} from 'react-apollo'

import {
  rendererFn,
  getCurrentBlock
} from 'medium-draft'
import {
  EditorBlock
} from 'draft-js'

const query = gql`
query get($path: String!) {
  ref {
    contents(path: $path) {
      download_url
    }
  }
}
`

const Image = ({className, src}) => (
  <img role='presentation' className={className} src={src} />
)

const ImageWithQuery = graphql(query, {
  props: ({data}) => {
    const src = data.ref
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
  const { block, blockProps } = props
  const { getEditorState, basePath } = blockProps
  const data = block.getData()
  const src = data.get('src')
  const currentBlock = getCurrentBlock(getEditorState())
  const className = currentBlock.getKey() === block.getKey() ? 'md-image-is-selected' : ''
  if (src !== null) {
    return (
      <div>
        <div className='md-block-image-inner-container'>
          <ImageWithQuery className={className} path={pathJoin(basePath, src)} />
        </div>
        <figcaption>
          <EditorBlock {...props} />
        </figcaption>
      </div>
    )
  }
  return <EditorBlock {...props} />
}

const customRendererFn = path => (setEditorState, getEditorState) => {
  const defaultHandler = rendererFn(setEditorState, getEditorState)
  return (contentBlock) => {
    const type = contentBlock.getType()

    if (type === 'atomic:image') {
      return {
        component: ImageBlock,
        props: {
          setEditorState,
          getEditorState,
          basePath: dirname(path)
        }
      }
    }
    return defaultHandler(contentBlock)
  }
}

export default customRendererFn
