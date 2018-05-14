import React from 'react';
import { Button, View, Text, TextInput } from 'react-native';
import { Provider } from 'react-redux';
import configureStore from './store/store.js';

import Navigation from './navigation';

const store = configureStore();


export default class App extends React.Component {
  render() {
    return (
      <Provider store={store}>
        <Navigation />
      </Provider>
    );
  }
}
