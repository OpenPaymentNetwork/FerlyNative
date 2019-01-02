import {Platform} from 'react-native'

export function makeOsIdentifier () {
  return `${Platform.OS}:${Platform.Version}`
}
