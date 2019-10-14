import createReducer from 'ferly/store/createReducer';

// Action types
export const API_REQUIRE = 'API_REQUIRE';
export const API_INJECT = 'API_INJECT';
export const API_EXPIRE = 'API_EXPIRE';
export const API_REFRESH = 'API_REFRESH';

// Actions to dispatch
export const apiRequire = (url) => ({type: API_REQUIRE, url: url});
export const apiInject = (url, data) => ({
  type: API_INJECT,
  url: url,
  data: data
});
export const apiExpire = (url) => ({type: API_EXPIRE, url: url});
export const apiRefresh = (url) => ({type: API_REFRESH, url: url});

const initialState = {
  apiStore: {}
};

// Reducer functions
const actionHandlers = {
  // Add data to store associated with the url
  [API_INJECT]: (state, {url, data}) => {
    return {apiStore: Object.assign({}, state.apiStore || {}, {[url]: data})};
  },
  // Delete saved data associated with the url
  [API_EXPIRE]: (state, {url}) => {
    const newStore = Object.assign({}, state.apiStore);
    delete newStore[url];
    return {apiStore: newStore};
  }
};

export default createReducer(initialState, actionHandlers);
