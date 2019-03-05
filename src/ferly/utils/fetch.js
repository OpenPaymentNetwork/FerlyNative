/* global __DEV__ */
import {Constants} from 'expo'
const {releaseChannel = 'staging'} = Constants.manifest

let host
if (__DEV__) {
  host = 'http://10.1.10.6:44225/' // Dev.ini
  // host = 'http://10.1.10.6:6543/' // Prod.ini
} else if (releaseChannel === 'production') {
  host = 'https://www.ferly.com/'
} else if (releaseChannel === 'staging') {
  host = 'https://www.ferly.com/' // TODO update this to new staging endpoint
}
const prefix = 'api/'
const baseUrl = host + prefix

// Used in GET calls. Convert api url and query params into a full url
// with query string. Adds device_id.
export function createUrl (urlTail, params = {}) {
  const url = baseUrl + urlTail
  const queries = []
  for (const key in params) {
    const encodedKey = encodeURIComponent(key)
    const encodedValue = encodeURIComponent(params[key])
    queries.push(encodedKey + '=' + encodedValue)
  }
  queries.push(`device_id=${Constants.deviceId}`)
  const queryString = queries.join('&')
  return [url, queryString].join('?')
}

export function post (urlTail, params = {}) {
  Object.assign(params, {device_id: Constants.deviceId})
  const url = baseUrl + urlTail
  return fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(params)
  })
}
