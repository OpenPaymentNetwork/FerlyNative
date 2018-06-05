import {createStore, applyMiddleware} from 'redux'
import {API_REQUIRE, apiInject} from './api'
import rootReducer from './rootReducer'

// Convert all API_REQUIRE types into API_INJECT types after
// fetching the data they depend on
const apiMiddleware = (store) => (next) => (action) => {
  if (action.type === API_REQUIRE) {
    const currentStore = store.getState()
    const currentApiStore = currentStore.apiStore

    // or if the data has expired (add meta to store)
    if (!currentApiStore.hasOwnProperty(action.url)) {
      fetch(action.url)
        .then((response) => response.json())
        .then((responseJson) => {
          console.log('CALL:', action.url, responseJson)
          // It shouldn't return a 200 OK response, handle it in catch
          if (!responseJson.hasOwnProperty('error')) {
            next(apiInject(action.url, responseJson))
          } else {
            console.log('REMOVE THIS ERROR STUFF')
          }
        })
        .catch((error) => {
          console.log('there was an error connecting to ferly server')
          // console.error(error)
        })
    } else {
      console.log('retrieving from cache:', action.url)
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
