import {Constants} from 'expo'

// const host = 'http://ferly-env.xccscenpxm.us-east-2.elasticbeanstalk.com/'
// const host = 'http://192.168.3.6:44225/' // wingcashguest
const host = 'http://192.168.2.131:44225/' // sendmi5g
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
