import {combineReducers} from 'redux'

import api from './api'
import settings from './settings'

export default combineReducers({
  api,
  settings
})
