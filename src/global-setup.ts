import path from 'path'

export default () => {
  process.env.__RESOURCE_DIR__ = path.join(__dirname, 'resources')
  require('dotenv').config()
}
