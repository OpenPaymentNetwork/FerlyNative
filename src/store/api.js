import createReducer from './createReducer'

// Action types
export const API_REQUIRE = 'API_REQUIRE'
export const API_INJECT = 'API_INJECT'

// Actions to dispatch
export const apiRequire = (url) => ({type: API_REQUIRE, url: url})
export const apiInject = (url, data) => ({
  type: API_INJECT,
  url: url,
  data: data
})

const initialState = {
  apiStore: {}
}

// Reducer functions
const actionHandlers = {
  // Add data to store associated with the url
  [API_INJECT]: (state, {url, data}) => {
    return {apiStore: Object.assign({[url]: data}, state.apiStore)}
  }
}

export default createReducer(initialState, actionHandlers)
