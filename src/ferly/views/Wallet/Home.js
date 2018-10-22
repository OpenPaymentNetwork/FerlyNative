import accounting from 'ferly/utils/accounting'
import Icon from 'react-native-vector-icons/FontAwesome'
import PropTypes from 'prop-types'
import React from 'react'
import Spinner from 'ferly/components/Spinner'
import Theme from 'ferly/utils/theme'
import {View, TouchableOpacity, Text, ScrollView, Image} from 'react-native'
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

  renderCard (design) {
    const {navigation} = this.props
    const {amount, id, title} = design
    const walletUrl = design.wallet_url
    const formatted = accounting.formatMoney(parseFloat(amount))

    const img = walletUrl
      ? <Image source={{uri: walletUrl}} style={{height: 130, width: 130}} />
      : <Text>{design.title}</Text>

    return (
      <View key={id} style={{
        flex: 1,
        flexDirection: 'row',
        marginHorizontal: 20,
        marginVertical: 10,
        height: 130,
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: 'lightgray',
        elevation: 1.8,
        shadowOffset: {width: 2, height: 2},
        shadowColor: 'lightgray',
        shadowOpacity: 1
      }}>
        <View style={{
          width: 130,
          height: 130,
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {img}
        </View>
        <View style={{
          justifyContent: 'space-between',
          flex: 1,
          flexDirection: 'column',
          borderLeftWidth: 0.5,
          borderColor: 'lightgray'
        }}>
          <View style={{flex: 1, paddingTop: 6, paddingLeft: 6}}>
            <Text style={{fontSize: 22}}>
              {formatted}
            </Text>
            <Text style={{fontSize: 16, color: 'gray'}}>
              {title}
            </Text>
          </View>
          <View style={{flexDirection: 'row', borderTopWidth: 1, borderColor: 'lightgray'}}>
            <TouchableOpacity
              style={{alignItems: 'center', justifyContent: 'center', height: 40, flex: 1, maxWidth: 100}}
              onPress={() => navigation.navigate('Give', design)}>
              <Text style={{color: Theme.lightBlue}}>GIVE GIFT</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{alignItems: 'center', justifyContent: 'center', height: 40, flex: 1, maxWidth: 100}}
              onPress={() => navigation.navigate('Purchase', {design})}>
              <Text style={{color: Theme.lightBlue}}>TOP UP</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    )
  }

  renderAmounts () {
    const amounts = this.props.amounts || []
    if (amounts.length === 0) {
      return (
        <Text style={{margin: 20, fontSize: 18}}>
          There’s nothing here! Click ‘+’ below to purchase your first gift.
        </Text>
      )
    } else {
      return (
        <ScrollView>
          {amounts.map((cashRow) => this.renderCard(cashRow))}
        </ScrollView>
      )
    }
  }
  render () {
    const {title, navigation} = this.props

    if (!title) {
      return <Spinner />
    }
    return (
      <View style={{flex: 1}}>
        {this.renderAmounts()}
        <TouchableOpacity
          style={{
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: Theme.lightBlue,
            position: 'absolute',
            bottom: 20,
            right: 25,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: 'lightgray',
            elevation: 5,
            shadowOffset: {width: 2, height: 2},
            shadowColor: 'lightgray',
            shadowOpacity: 1
          }}
          onPress={() => navigation.navigate('Market')}>
          <Icon
            name="plus"
            color="white"
            size={24} />
        </TouchableOpacity>
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
