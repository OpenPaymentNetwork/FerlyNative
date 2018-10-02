import {createStore, applyMiddleware} from 'redux'
import {API_REQUIRE, API_REFRESH, apiInject, apiExpire} from 'ferly/store/api'
import rootReducer from 'ferly/store/rootReducer'

// Convert all API_REQUIRE types into API_INJECT types after
// fetching the data they depend on
const apiMiddleware = (store) => (next) => (action) => {
  const {type} = action
  if (type === API_REQUIRE || type === API_REFRESH) {
    const currentStore = store.getState()
    const currentApiStore = currentStore.apiStore

    // and if the data has expired (add meta to store),
    // and if the data is already being fetched
    if (!currentApiStore.hasOwnProperty(action.url) || type === API_REFRESH) {
      if (type === API_REFRESH) {
        next(apiExpire(action.url))
      }
      fetch(action.url)
        .then((response) => response.json())
        .then((responseJson) => {
          // All responses return, only network errors are "caught"
          next(apiInject(action.url, responseJson))
        })
        .catch((error) => {
          // network error
          console.error(error)
          next(apiInject(action.url, error.toString()))
        })
    }
  } else {
    next(action)
  }
}

export default function configureStore () {
  let store = createStore(
    rootReducer,
    applyMiddleware(
      apiMiddleware
    )
  )

  return store
}
