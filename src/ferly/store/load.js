import createReducer from 'ferly/store/createReducer'

// Action types
export const CHECKED_UID_PROMPT = 'CHECKED_UID_PROMPT'

// Actions to dispatch
export const checkedUidPrompt = () => ({type: CHECKED_UID_PROMPT})

// App initial state
const initialState = {
  checkUidPrompt: true
}

// Reducer functions
const actionHandlers = {
  // Mark that the app has loaded
  [CHECKED_UID_PROMPT]: (state) => {
    return {checkUidPrompt: false}
  }
}

export default createReducer(initialState, actionHandlers)
