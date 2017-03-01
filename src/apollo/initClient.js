import ApolloClient, { createNetworkInterface } from 'apollo-client'
import {GRAPHQL_URI} from '../../constants'

let apolloClient = null

function createClient (headers) {
  return new ApolloClient({
    ssrMode: !process.browser,
    dataIdFromObject: result => result.id || null,
    networkInterface: createNetworkInterface({
      uri: GRAPHQL_URI,
      opts: {
        credentials: 'same-origin',
        headers
      }
    })
  })
}

export const initClient = (headers) => {
  if (!process.browser) {
    return createClient(headers)
  }
  if (!apolloClient) {
    apolloClient = createClient(headers)
  }
  return apolloClient
}
