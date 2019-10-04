import createReducer from 'ferly/store/createReducer'

// Action types
export const CHECKED_UID_PROMPT = 'CHECKED_UID_PROMPT'
export const UPDATE_DOWNLOADED = 'UPDATE_DOWNLOADED'
export const SET_DEVICE_ID = 'SET_DEVICE_ID'

// Actions to dispatch
export const checkedUidPrompt = () => ({type: CHECKED_UID_PROMPT})
export const updateDownloaded = () => ({type: UPDATE_DOWNLOADED})
export const setDeviceId = (id) => ({type: SET_DEVICE_ID, id: id})

// App initial state
const initialState = {
  checkUidPrompt: true,
  updateDownloaded: false,
  deviceId: ''
}

// Reducer functions
const actionHandlers = {
  // Mark that the app has a new update in the cache
  [UPDATE_DOWNLOADED]: (state) => {
    return {updateDownloaded: true}
  },
  [CHECKED_UID_PROMPT]: (state) => {
    return {checkUidPrompt: false}
  },
  [SET_DEVICE_ID]: (state, dictionary) => {
    return {deviceId: dictionary.id}
  }
}

export default createReducer(initialState, actionHandlers)
