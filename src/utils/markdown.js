import {draftToMarkdown, markdownToDraft} from 'markdown-draft-js'

// md to draft
const blockTypes = {
  image_open: (item) => {
    return {
      type: 'atomic:image',
      data: {
        src: item.src,
        alt: item.alt
      }
    }
  }
}

const ImageRegexp = /^!\[([^\]]*)]\s*\(([^)"]+)( "([^)"]+)")?\)/
const imageWrapper = (remarkable) => {
  remarkable.block.ruler.before('paragraph', 'image', (state, startLine, endLine, silent) => {
    const pos = state.bMarks[startLine] + state.tShift[startLine]
    const max = state.eMarks[startLine]

    if (pos >= max) {
      return false
    }
    if (!state.src) {
      return false
    }
    if (state.src[pos] !== '!') {
      return false
    }

    var match = ImageRegexp.exec(state.src.slice(pos))
    if (!match) {
      return false
    }

    // in silent mode it shouldn't output any tokens or modify pending
    if (!silent) {
      state.tokens.push({
        type: 'image_open',
        src: match[2],
        alt: match[1],
        lines: [ startLine, state.line ],
        level: state.level
      })

      state.tokens.push({
        type: 'inline',
        content: match[4] || '',
        level: state.level + 1,
        lines: [ startLine, state.line ],
        children: []
      })

      state.tokens.push({
        type: 'image_close',
        level: state.level
      })
    }

    state.line = startLine + 1

    return true
  })
}

// draft to md
const styleItems = {
  'atomic:image': {
    open: (block) => {
      const alt = block.data.alt || ''
      const title = block.text
        ? ` "${block.text}"`
        : ''
      block.text = ''
      return `![${alt}](${block.data.src}${title})`
    },
    close: () => ''
  }
}

export const convertMdToDraft = md => markdownToDraft(
  md,
  {
    use: [imageWrapper],
    blockTypes
  }
)

export const convertDraftToMd = raw => draftToMarkdown(
  raw,
  {
    styleItems
  }
)
