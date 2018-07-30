import CashDisplay from 'ferly/components/CashDisplay'
import PropTypes from 'prop-types'
import React from 'react'
import Theme from 'ferly/utils/theme'
import {View, Button} from 'react-native'

export default class GiftCard extends React.Component {
  static navigationOptions = {
    title: 'Gift Card'
  };

  render () {
    const {navigation} = this.props
    const design = navigation.state.params
    return (
      <View>
        <CashDisplay
          navigation={this.props.navigation}
          design={design} />
        <Button
          title="Give Gift"
          color={Theme.darkBlue}
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
