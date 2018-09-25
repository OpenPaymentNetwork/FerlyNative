import CashDisplay from 'ferly/components/CashDisplay'
import PropTypes from 'prop-types'
import React from 'react'
import Theme from 'ferly/utils/theme'
import {View, Button} from 'react-native'

export default class GiftCard extends React.Component {
  static navigationOptions = {
    title: 'Gift Value'
  };

  render () {
    const {navigation} = this.props
    const design = navigation.state.params
    return (
      <View style={{flex: 1}}>
        <View style={{flex: 1, backgroundColor: 'white'}}>
          <CashDisplay
            navigation={this.props.navigation}
            design={design} />
        </View>
        <Button
          title="Give Gift Value"
          color={Theme.lightBlue}
          style={{
            width: '100%',
            position: 'absolute',
            bottom: 0}}
          onPress={
            () => navigation.navigate('Give', design)}
        />
      </View>
    )
  }
}

GiftCard.propTypes = {
  navigation: PropTypes.object.isRequired
}
