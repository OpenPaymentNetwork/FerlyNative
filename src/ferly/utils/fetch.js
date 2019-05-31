/* global __DEV__ */
import {Constants} from 'expo'
const {releaseChannel = 'staging', env} = Constants.manifest

export let envId = releaseChannel.charAt(0)
let host
if (__DEV__ && env.EXPO_LOCAL_SERVER === 'true') {
  host = 'http://10.1.10.6:44225/' // Dev.ini
  envId = 'l'
  // host = 'http://10.1.10.6:6543/' // Prod.ini
} else if (releaseChannel === 'production') {
  host = 'https://www.ferly.com/'
} else {
  host = 'http://ferlystaging.us-east-2.elasticbeanstalk.com/'
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

export const urls = {
  history: createUrl('history', {limit: 30}),
  profile: createUrl('profile')
}

function throwOn504 (response) {
  // 504 occurs when the server is updating for a couple seconds
  if (response.status === 504) {
    throw Error
  } else {
    return response
  }
}

export const retryFetch = async (url, options, tries = 5, delay = 2000) => {
  if (__DEV__) tries = 1
  try {
    return await fetch(url, options).then(throwOn504)
  } catch (err) {
    if (tries === 1) {
      throw err
    }
    return new Promise(function (resolve, reject) {
      setTimeout(function () {
        const p = retryFetch(url, options, tries - 1, delay * 2)
        p.then(resolve(p)).catch(() => reject(err))
      }, delay)
    })
  }
}
