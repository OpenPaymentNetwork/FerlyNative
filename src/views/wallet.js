import { Permissions, Notifications, Constants } from 'expo'
import CashDisplay from '../components/CashDisplay'
import HorizontalRuler from '../components/HorizontalRuler'
import ProfileDisplay from '../components/ProfileDisplay'
import PropTypes from 'prop-types'
import React from 'react'
import Theme from '../utils/theme'
import {apiRequire} from '../store/api'
import {Button, View, ActivityIndicator, TouchableOpacity} from 'react-native'
import {connect} from 'react-redux'
import {createUrl} from '../utils/fetch'

export class WalletScreen extends React.Component {
  static navigationOptions = {
    title: 'Wallet'
  };

  componentDidMount () {
    this.props.apiRequire(this.props.walletUrl)
    // this.getToken()
  }

  // async getToken () {
  //   const status = await Permissions.askAsync(Permissions.NOTIFICATIONS)
  //   let token = await Notifications.getExpoPushTokenAsync()
  //   console.log('token:', token)
  // }

  render () {
    const {title, profileImage} = this.props
    const amounts = this.props.amounts || []

    if (!title) {
      return (
        <View
          style={{flex: 1, justifyContent: 'center', flexDirection: 'row'}}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )
    }
    return (
      <View style={{flex: 1, paddingHorizontal: 20}}>
        <ProfileDisplay name={title} url={profileImage} />
        <HorizontalRuler marginVertical='0' color={Theme.yellow} />
        {
          amounts.map((cashRow) => {
            return (
              <TouchableOpacity
                onPress={() => this.props.navigation.navigate('Cash', cashRow)}>
                <CashDisplay
                  design={cashRow}
                  key={cashRow.id} />
              </TouchableOpacity>
            )
          })
        }
      </View>
    )
  }
}

WalletScreen.propTypes = {
  apiRequire: PropTypes.func.isRequired,
  amounts: PropTypes.array,
  title: PropTypes.string,
  profileImage: PropTypes.string,
  walletUrl: PropTypes.string.isRequired,
  navigation: PropTypes.object.isRequired
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

export default connect(map, dispatch)(WalletScreen)
