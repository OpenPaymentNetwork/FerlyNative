import createReducer from 'ferly/store/createReducer';

// Action types
export const CHECKED_UID_PROMPT = 'CHECKED_UID_PROMPT';
export const UPDATE_DOWNLOADED = 'UPDATE_DOWNLOADED';
export const SET_DEVICE_TOKEN = 'SET_DEVICE_TOKEN';
export const SET_HAVE_CARD = 'SET_HAVE_CARD';
export const SET_IS_CUSTOMER = 'SET_IS_CUSTOMER';
export const SET_DONE_TUTORIAL = 'SET_DONE_TUTORIAL';
export const SET_EXPO_TOKEN = 'SET_EXPO_TOKEN';
export const SET_INITIAL_EXPO_TOKEN = 'SET_INITIAL_EXPO_TOKEN';
export const SET_REFRESH_HISTORY = 'SET_REFRESH_HISTORY';

// Actions to dispatch
export const checkedUidPrompt = () => ({type: CHECKED_UID_PROMPT});
export const updateDownloaded = () => ({type: UPDATE_DOWNLOADED});
export const setDeviceToken = (id) => ({type: SET_DEVICE_TOKEN, id: id});
export const setHaveCard = (input) => ({type: SET_HAVE_CARD, input: input});
export const setIsCustomer = (input) => ({type: SET_IS_CUSTOMER, input: input});
export const setDoneTutorial = (input) => ({type: SET_DONE_TUTORIAL, input: input});
export const setExpoToken = (token) => ({type: SET_EXPO_TOKEN, token: token});
export const setInitialExpoToken = (token) => ({type: SET_INITIAL_EXPO_TOKEN, token: token});
export const setRefreshHistory = (input) => ({type: SET_REFRESH_HISTORY, input: input});

// App initial state
const initialState = {
  checkUidPrompt: true,
  updateDownloaded: false,
  refreshHistory: false,
  deviceToken: '',
  expoToken: '',
  initialExpoToken: '',
  haveCard: true,
  isCustomer: '',
  doneTutorial: ''
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
  [SET_IS_CUSTOMER]: (state, dictionary) => {
    return {isCustomer: dictionary.input};
  },
  [SET_DONE_TUTORIAL]: (state, dictionary) => {
    return {doneTutorial: dictionary.input};
  },
  [SET_REFRESH_HISTORY]: (state, dictionary) => {
    return {refreshHistory: dictionary.input};
  }
};

export default createReducer(initialState, actionHandlers);
