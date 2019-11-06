import createReducer from 'ferly/store/createReducer';

// Action types
export const CHECKED_UID_PROMPT = 'CHECKED_UID_PROMPT';
export const UPDATE_DOWNLOADED = 'UPDATE_DOWNLOADED';
export const SET_DEVICE_TOKEN = 'SET_DEVICE_TOKEN';
export const SET_HAVE_CARD = 'SET_HAVE_CARD';
export const SET_SIGN_OUT = 'SET_SIGN_OUT';
export const SET_EXPO_TOKEN = 'SET_EXPO_TOKEN';
export const SET_INITIAL_EXPO_TOKEN = 'SET_INITIAL_EXPO_TOKEN';

// Actions to dispatch
export const checkedUidPrompt = () => ({type: CHECKED_UID_PROMPT});
export const updateDownloaded = () => ({type: UPDATE_DOWNLOADED});
export const setDeviceToken = (id) => ({type: SET_DEVICE_TOKEN, id: id});
export const setHaveCard = (input) => ({type: SET_HAVE_CARD, input: input});
export const setSignOut = (input) => ({type: SET_SIGN_OUT, input: input});
export const setExpoToken = (token) => ({type: SET_EXPO_TOKEN, token: token});
export const setInitialExpoToken = (token) => ({type: SET_INITIAL_EXPO_TOKEN, token: token});

// App initial state
const initialState = {
  checkUidPrompt: true,
  updateDownloaded: false,
  deviceToken: '',
  expoToken: '',
  initialExpoToken: '',
  haveCard: true,
  signOut: true
};

// Reducer functions
const actionHandlers = {
  // Mark that the app has a new update in the cache
  [UPDATE_DOWNLOADED]: (state) => {
    return {updateDownloaded: true};
  },
  [CHECKED_UID_PROMPT]: (state) => {
    return {checkUidPrompt: false};
  },
  [SET_DEVICE_TOKEN]: (state, dictionary) => {
    return {deviceToken: dictionary.id};
  },
  [SET_EXPO_TOKEN]: (state, dictionary) => {
    return {expoToken: dictionary.token};
  },
  [SET_INITIAL_EXPO_TOKEN]: (state, dictionary) => {
    return {initialExpoToken: dictionary.token};
  },
  [SET_HAVE_CARD]: (state, dictionary) => {
    return {haveCard: dictionary.input};
  },
  [SET_SIGN_OUT]: (state, dictionary) => {
    return {signOut: dictionary.input};
  }
};

export default createReducer(initialState, actionHandlers);
