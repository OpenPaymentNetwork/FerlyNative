import React from 'react'
import {View, Text} from 'react-native'

export class FerlyCardScreen extends React.Component {
  static navigationOptions = {
    title: 'Ferly Card'
  };

  render () {
    return (
      <View>
        <Text>My Ferly Card</Text>
      </View>
    )
  }
}

export default FerlyCardScreen
