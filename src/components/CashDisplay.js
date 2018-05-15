import PropTypes from 'prop-types'
import React from 'react'
import {Text, View, Image} from 'react-native'

export default class CashDisplay extends React.Component {
  render () {
    const {name, url, amount} = this.props
    return (
      <View style={{flexDirection: 'row', marginVertical: 10}}>
        <View style={{
          flexDirection: 'row',
          height: 90,
          backgroundColor: '#FFF',
          borderWidth: 0.5,
          borderColor: 'black',
          borderRadius: 10}}>
          <Image
            style={{width: 85, height: 70, margin: 10}}
            source={{uri: url}} />
          <Text style={{width: 80, textAlign: 'center', marginTop: 32}}>
            {name}
          </Text>
        </View>
        <View style={{justifyContent: 'center', flex: 1}}>
          <Text style={{textAlign: 'center'}}>
            ${amount}
          </Text>
        </View>
      </View>
    )
  }
}

CashDisplay.propTypes = {
  amount: PropTypes.string,
  name: PropTypes.string,
  url: PropTypes.string
}
