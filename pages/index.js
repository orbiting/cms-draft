import App from '../src/components/App'
import List from '../src/components/List'
import withData from '../src/apollo/withData'

export default withData((props) => (
  <App>
    <List />
  </App>
))
