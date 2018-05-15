import {Constants} from 'expo'

const host = 'http://ferly-env.xccscenpxm.us-east-2.elasticbeanstalk.com/'
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
