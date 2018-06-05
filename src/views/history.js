import React from 'react'
import {View, Text} from 'react-native'

export class HistoryScreen extends React.Component {
  static navigationOptions = {
    title: 'History'
  };

  render () {
    return (
      <View>
        <Text>History</Text>
      </View>
    )
  }
}

export default HistoryScreen
