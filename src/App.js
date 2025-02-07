import AppEntry from 'ferly/views/AppEntry';
import configureStore from 'ferly/store/store.js';
import EventListener from 'ferly/components/EventListener';
import React from 'react';
import * as Sentry from 'sentry-expo';
import {Provider} from 'react-redux';

Sentry.init({
  dns: 'https://20f3964a92714c59a5ae17e74e40c8ec@sentry.io/1398868',
  enableNative: false
});

const store = configureStore();
console.warn = () => {};

export default class App extends React.Component {
  render () {
    return (
      <Provider store={store}>
        <EventListener>
          <AppEntry />
        </EventListener>
      </Provider>
    );
  }
}
