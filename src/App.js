import configureStore from './store/store.js'
import React from 'react'
import {Provider} from 'react-redux'

import Navigation from './navigation'

const store = configureStore()

export default class App extends React.Component {
  render () {
    return (
      <Provider store={store}>
        <Navigation />
      </Provider>
    )
  }
}
