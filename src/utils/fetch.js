import { Constants } from 'expo';

const host = 'http://ferly-env.xccscenpxm.us-east-2.elasticbeanstalk.com/';
const prefix = 'api/';
const base_url = host + prefix;

// Used in GET calls. Convert api url and query params into a full url
// with query string. Adds device_id.
export function createUrl(url_tail, params={}) {
  console.log('using:', url_tail);
  const url = base_url + url_tail;
  const queries = [];
  for(key in params) {
    const encoded_key = encodeURIComponent(key);
    const encoded_value = encodeURIComponent(params[key]);
    queries.push(encoded_key + '=' + encoded_value);
  }
  queries.push(`device_id=${Constants.deviceId}`);
  const queryString = queries.join('&');
  return [url, queryString].join('?');
}
