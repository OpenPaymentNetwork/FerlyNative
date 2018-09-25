import CashDisplay from 'ferly/components/CashDisplay'
import PropTypes from 'prop-types'
import React from 'react'
import Spinner from 'ferly/components/Spinner'
import Theme from 'ferly/utils/theme'
import {Button, View, TouchableOpacity, Text} from 'react-native'
import {apiRequire} from 'ferly/store/api'
import {connect} from 'react-redux'
import {createUrl} from 'ferly/utils/fetch'

export class Wallet extends React.Component {
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
  //   console.log('id:', Constants.deviceId)
  // }

  renderAmounts () {
    const {navigation} = this.props
    const amounts = this.props.amounts || []
    if (amounts.length === 0) {
      return <Text>You have no gift value.</Text>
    } else {
      const wallet = amounts.map((cashRow) => {
        return (
          <TouchableOpacity
            key={cashRow.id}
            onPress={() => navigation.navigate('Cash', cashRow)}>
            <CashDisplay showCaret design={cashRow} />
          </TouchableOpacity>
        )
      })
      return wallet
    }
  }

  render () {
    const {title, navigation} = this.props

    if (!title) {
      return <Spinner />
    }
    return (
      <View style={{flex: 1}}>
        <View style={{flex: 1, backgroundColor: 'white'}}>
          {this.renderAmounts()}
        </View>
        <Button
          title="Add Gift Value"
          color={Theme.lightBlue}
          style={{
            width: '100%',
            position: 'absolute',
            bottom: 0}}
          onPress={() => navigation.navigate('Market')}
        />
      </View>
    )
  }
}

Wallet.propTypes = {
  apiRequire: PropTypes.func.isRequired,
  amounts: PropTypes.array,
  title: PropTypes.string,
  profileImage: PropTypes.string,
  walletUrl: PropTypes.string.isRequired,
  navigation: PropTypes.object.isRequired
}

function mapStateToProps (state) {
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

const mapDispatchToProps = {
  apiRequire
}

export default connect(mapStateToProps, mapDispatchToProps)(Wallet)
