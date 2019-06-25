import * as Expo from 'expo'
import App from './App'
import {activateKeepAwake} from 'expo-keep-awake'

if (process.env.NODE_ENV === 'development') {
  activateKeepAwake()
}

Expo.registerRootComponent(App)
