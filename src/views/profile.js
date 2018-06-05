import React from 'react'
import {View, Text} from 'react-native'

export class ProfileScreen extends React.Component {
  static navigationOptions = {
    title: 'Profile'
  };

  render () {
    return (
      <View>
        <Text>Profile</Text>
      </View>
    )
  }
}

export default ProfileScreen
