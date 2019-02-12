import createReducer from 'ferly/store/createReducer'

// Action types
export const CHECKED_UID_PROMPT = 'CHECKED_UID_PROMPT'
export const UPDATE_DOWNLOADED = 'UPDATE_DOWNLOADED'

// Actions to dispatch
export const checkedUidPrompt = () => ({type: CHECKED_UID_PROMPT})
export const updateDownloaded = () => ({type: UPDATE_DOWNLOADED})

// App initial state
const initialState = {
  checkUidPrompt: true,
  updateDownloaded: false
}

// Reducer functions
const actionHandlers = {
  // Mark that the app has a new update in the cache
  [UPDATE_DOWNLOADED]: (state) => {
    return {updateDownloaded: true}
  },
  [CHECKED_UID_PROMPT]: (state) => {
    return {checkUidPrompt: false}
  }
}

export default createReducer(initialState, actionHandlers)
