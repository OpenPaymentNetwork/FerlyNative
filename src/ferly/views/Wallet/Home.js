import accounting from 'ferly/utils/accounting'
import Icon from 'react-native-vector-icons/FontAwesome'
import PropTypes from 'prop-types'
import React from 'react'
import Spinner from 'ferly/components/Spinner'
import Theme from 'ferly/utils/theme'
import {
  View,
  TouchableOpacity,
  Text,
  ScrollView,
  Image,
  Alert
} from 'react-native'
import {apiRequire} from 'ferly/store/api'
import {checkedUidPrompt} from 'ferly/store/settings'
import {connect} from 'react-redux'
import {urls} from 'ferly/utils/fetch'

export class Wallet extends React.Component {
  static navigationOptions = {
    title: 'Wallet'
  };

  componentDidMount () {
    this.props.apiRequire(urls.profile)
  }

  renderCard (design) {
    const {navigation} = this.props
    const {amount, id, title, wallet_image_url: walletImage} = design
    const formatted = accounting.formatMoney(parseFloat(amount))

    const img = walletImage
      ? <Image source={{uri: walletImage}} style={{height: 130, width: 130}} />
      : <Text>{title}</Text>

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
              <Text style={{color: Theme.lightBlue}}>BUY</Text>
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
          <View style={{height: 80}} />
        </ScrollView>
      )
    }
  }

  showAddAccountRecoveryDialog () {
    const {navigation, amounts, uids, checkedUidPrompt} = this.props
    if (uids.length > 0 || amounts.length === 0) {
      return
    }
    const title = 'Add Account Recovery'
    const message = (
      'If you replace your phone or uninstall the app you\'ll need to ' +
      'recover your account using a verified email address or phone number. ' +
      'You may lose your gift cards if account recovery is not set up prior ' +
      'to replacing your phone or uninstalling the app.'
    )
    const buttons = [
      {
        text: 'Close',
        onPress: () => checkedUidPrompt()
      },
      {
        text: 'Add',
        onPress: () => {
          checkedUidPrompt()
          navigation.navigate('Recovery')
        }
      }
    ]
    Alert.alert(title, message, buttons, {cancelable: false})
  }

  render () {
    const {firstName, navigation, checkUidPrompt} = this.props

    if (!firstName) {
      return <Spinner />
    }

    if (checkUidPrompt) {
      this.showAddAccountRecoveryDialog()
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
  amounts: PropTypes.array,
  apiRequire: PropTypes.func.isRequired,
  checkUidPrompt: PropTypes.bool,
  checkedUidPrompt: PropTypes.func.isRequired,
  firstName: PropTypes.string,
  lastName: PropTypes.string,
  navigation: PropTypes.object.isRequired,
  profileImage: PropTypes.string,
  uids: PropTypes.array
}

function mapStateToProps (state) {
  const apiStore = state.api.apiStore
  const {checkUidPrompt, updateDownloaded} = state.settings
  const {
    amounts,
    profile_image_url: profileImage,
    first_name: firstName,
    last_name: lastName,
    uids = []
  } = apiStore[urls.profile] || {}

  return {
    amounts,
    firstName,
    lastName,
    profileImage,
    uids,
    checkUidPrompt,
    updateDownloaded
  }
}

const mapDispatchToProps = {
  apiRequire,
  checkedUidPrompt
}

export default connect(mapStateToProps, mapDispatchToProps)(Wallet)
