import React from 'react';
import { Text, View, Image } from 'react-native';

export default class ProfileDisplay extends React.Component {

  render() {
    const {name, url} = this.props;
    return (
      <View marginVertical={10} style={{flexDirection: 'row'}}>
        <Image
          style={{width: 80, height: 80, marginRight:20, borderRadius:20}}
          source={{uri: url}} />
        <View style={{justifyContent: 'center', flex: 1}}>
          <Text style={{fontSize: 36}}>
            {name}
          </Text>
        </View>
      </View>
    );
  }

}
