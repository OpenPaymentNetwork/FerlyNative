import {createStore, applyMiddleware} from 'redux';
import {API_REQUIRE, API_REFRESH, apiInject} from 'ferly/store/api';
import rootReducer from 'ferly/store/rootReducer';
import {retryFetch} from 'ferly/utils/fetch';
// Convert all API_REQUIRE types into API_INJECT types after
// fetching the data they depend on
const apiMiddleware = (store) => (next) => (action) => {
  const {type} = action;
  if (type === API_REQUIRE || type === API_REFRESH) {
    const state = store.getState();
    const currentApiStore = state.api.apiStore;
    let deviceToken = state.settings.deviceToken;
    if (!deviceToken) {
      setTimeout(() => {
        const state = store.getState();
        deviceToken = state.settings.deviceToken;
        retryFetch(action.url, deviceToken)
          .then((response) => response.json())
          .then((responseJson) => {
            next(apiInject(action.url, responseJson));
          })
          .catch((error) => {
            next(apiInject(action.url, error.toString()));
          });
      }, 300);
    }

    // and if the data has expired (add meta to store),
    // and if the data is already being fetched
    if (!currentApiStore.hasOwnProperty(action.url) || type === API_REFRESH) {
      retryFetch(action.url, deviceToken, {
        headers: {
          Authorization: 'Bearer ' + deviceToken
        }
      })
        .then((response) => response.json())
        .then((responseJson) => {
          next(apiInject(action.url, responseJson));
        })
        .catch((error) => {
          next(apiInject(action.url, error.toString()));
        });
    }
  } else {
    next(action);
  }
};
export default function configureStore () {
  let store = createStore(
    rootReducer,
    applyMiddleware(
      apiMiddleware
    )
  );
  return store;
}
