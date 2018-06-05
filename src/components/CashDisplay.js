import PropTypes from 'prop-types'
import React from 'react'
import {Text, View, Image} from 'react-native'

export default class CashDisplay extends React.Component {
  render () {
    const design = this.props.design
    return (
      <View style={{flexDirection: 'row', marginVertical: 10}}>
        <View
          style={{
            flexDirection: 'row',
            height: 90,
            backgroundColor: '#FFF',
            borderWidth: 0.5,
            borderColor: 'black',
            borderRadius: 10}}>
          <Image
            style={{width: 85, height: 70, margin: 10}}
            source={{uri: design.url}} />
          <Text style={{width: 80, textAlign: 'center', marginTop: 32}}>
            {design.title}
          </Text>
        </View>
        <View style={{justifyContent: 'center', flex: 1}}>
          <Text style={{textAlign: 'center'}}>
            ${design.amount}
          </Text>
        </View>
      </View>
    )
  }
}

CashDisplay.propTypes = {
  design: PropTypes.object, // specify as {id,title,url,amount}
}
