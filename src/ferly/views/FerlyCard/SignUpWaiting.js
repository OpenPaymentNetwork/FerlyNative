import React from 'react'
import {View, Text, Image} from 'react-native'
import {mailCard} from 'ferly/images/index'
import PrimaryButton from 'ferly/components/PrimaryButton'
import Theme from 'ferly/utils/theme'
import PropTypes from 'prop-types'

export default class SignUpWaiting extends React.Component {
  static navigationOptions = {
    title: 'Ferly Card'
  };

  render () {
    const {navigation} = this.props
    return (
      <View style={{flex: 1}}>
        <View style={{paddingVertical: 20, paddingTop: 30}} >
          <Text style={{paddingHorizontal: 15, fontSize: 20, textAlign: 'center', color: Theme.darkBlue}} >
            Your card is on its way! Activate it below when it arrives.
          </Text>
        </View>
        <View style={{paddingVertical: 20}} >
          <Image style={{resizeMode: 'contain', height: 300, width: 420}} source={mailCard} />
        </View>
        <View style={{paddingVertical: 50}}>
          <PrimaryButton
            title="Wallet"
            color={Theme.lightBlue}
            onPress={() => navigation.navigate('Wallet')} />
        </View>
      </View>
    )
  }
}

SignUpWaiting.propTypes = {
  navigation: PropTypes.object.isRequired
}
