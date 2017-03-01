import {
  ImageSideButton,
  addNewBlock,
  Block
} from 'medium-draft'
import {repo} from '../api/github'
import md5 from 'blueimp-md5'

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

class CustomImageSideButton extends ImageSideButton {
  onChange (e) {
    const file = e.target.files[0]
    if (file.type.indexOf('image/') === 0) {
      readFile(file).then(({content, filename}) => {
        repo.writeFile(
          'test',
          `content/images/${md5(content)}-${filename}`,
          content,
          'Upload Image',
          {encode: false},
          (error, data) => {
            if (error) {
              console.error(error)
            } else {
              this.props.setEditorState(addNewBlock(
                this.props.getEditorState(),
                Block.IMAGE, {
                  src: `./images/${data.content.name}`
                }
              ))
            }
          }
        )
      })
    }
    this.props.close()
  }
}

export default CustomImageSideButton
