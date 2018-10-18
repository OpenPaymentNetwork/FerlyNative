import React from 'react'
import {View, Image} from 'react-native'
import {ferlyCard} from 'ferly/images/index'

export class FerlyCard extends React.Component {
  static navigationOptions = {
    title: 'Ferly Card'
  };

  render () {
    return (
      <View style={{flex: 1, justifyContent: 'space-around', flexDirection: 'row'}}>
        <Image style={{width: 300, height: 200}} source={ferlyCard} />
      </View>
    )
  }
}

export default FerlyCard
