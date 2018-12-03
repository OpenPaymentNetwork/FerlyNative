import {combineReducers} from 'redux'

import api from './api'
import load from './load'

export default combineReducers({
  api,
  load
})
