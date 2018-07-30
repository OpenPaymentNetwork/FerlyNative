import AppEntry from 'ferly/views/AppEntry'
import EventListener from 'ferly/components/EventListener'
import React from 'react'
import configureStore from 'ferly/store/store.js'
import {Provider} from 'react-redux'

const store = configureStore()

export default class App extends React.Component {
  render () {
    return (
      <Provider store={store}>
        <EventListener>
          <AppEntry />
        </EventListener>
      </Provider>
    )
  }
}
