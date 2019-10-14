/* global __DEV__ */
import Constants from 'expo-constants';
const {releaseChannel = 'staging', env} = Constants.manifest;

export let envId = releaseChannel.charAt(0);
let host;
if (__DEV__ && env.EXPO_LOCAL_SERVER) {
  // To use a local Ferly API server, start expo with this shell command:
  // EXPO_LOCAL_SERVER=http://LOCALIP:6543/ expo start
  // Replace LOCALIP with the LAN IP address of your machine.
  // (You don't usually want to use a WAN or localhost IP address.)
  host = env.EXPO_LOCAL_SERVER;
  if (!host.endsWith('/')) {
    host = host + '/';
  }
  envId = 'l';
  // host = 'http://10.1.10.6:6543/' // Prod.ini
} else if (releaseChannel === 'production') {
  host = 'https://ferlyapi.com/';
} else {
  host = 'http://ferlystaging.us-east-2.elasticbeanstalk.com/';
}
const prefix = 'api/';
const baseUrl = host + prefix;

// Used in GET calls. Convert api url and query params into a full url
// with query string. Adds device_id.
export function createUrl (urlTail, params = {}) {
  const url = baseUrl + urlTail;
  const queries = [];
  for (const key in params) {
    const encodedKey = encodeURIComponent(key);
    const encodedValue = encodeURIComponent(params[key]);
    queries.push(encodedKey + '=' + encodedValue);
  }
  const queryString = queries.join('&');
  return [url, queryString].join('?');
}

export function post (urlTail, deviceId, params = {}) {
  const url = baseUrl + urlTail;
  return fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + deviceId
    },
    body: JSON.stringify(params)
  });
}

export const urls = {
  history: createUrl('history', {limit: 30}),
  profile: createUrl('profile')
};

export const retryFetch = async (url, deviceId, tries = 5, delay = 2000) => {
  if (__DEV__) tries = 1;
  try {
    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
        Authorization: 'Bearer ' + deviceId
      }
    });
    // change back to 400
    if (response.status >= 401) {
      if (__DEV__) {
        window.alert('Failed response to ' + url + ': ' + response.status);
      }
      throw Error;
    }

    return response;
  } catch (err) {
    if (__DEV__ && tries === 1) {
      throw err;
    }
    return new Promise(function (resolve, reject) {
      setTimeout(function () {
        const p = retryFetch(url, tries - 1, delay * 2);
        p.then(resolve(p)).catch(() => reject(err));
      }, delay);
    });
  }
};
