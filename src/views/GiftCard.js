import React from 'react'
import CashDisplay from '../components/CashDisplay'
import Theme from '../utils/theme'
import {View, Text, Button} from 'react-native'
import {apiRequire} from '../store/api'
import {connect} from 'react-redux'
import {createUrl} from '../utils/fetch'

export class GiftCardScreen extends React.Component {
  static navigationOptions = {
    title: 'Gift Card'
  };

  constructor(props) {
    super(props)
  }

  componentDidMount () {
    this.props.apiRequire(this.props.walletUrl)
  }

  render () {
    const design = this.props.navigation.state.params
    return (
      <View>
        <CashDisplay
          navigation={this.props.navigation}
          design={design} />
        <Button
          title="Give Gift"
          color={Theme.darkBlue}
          onPress={
            () => this.props.navigation.navigate('Give')}
        />
      </View>
    )
  }
}
function map (state) {
  const walletUrl = createUrl('wallet')
  const apiStore = state.apiStore
  const myWallet = apiStore[walletUrl] || {}
  const {amounts, title, profileImage} = myWallet

  return {
    walletUrl,
    amounts,
    title,
    profileImage
  }
}

const dispatch = {
  apiRequire
}

export default connect(map, dispatch)(GiftCardScreen)
