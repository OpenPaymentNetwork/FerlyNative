import accounting from 'ferly/utils/accounting'
import Icon from 'react-native-vector-icons/FontAwesome'
import PropTypes from 'prop-types'
import React from 'react'
import Spinner from 'ferly/components/Spinner'
import Theme from 'ferly/utils/theme'
import TestElement from 'ferly/components/TestElement'
import {apiRequire, apiRefresh} from 'ferly/store/api'
import {checkedUidPrompt} from 'ferly/store/settings'
import {connect} from 'react-redux'
import {urls} from 'ferly/utils/fetch'
import {
  View,
  TouchableOpacity,
  Text,
  RefreshControl,
  ScrollView,
  Alert,
  StyleSheet
} from 'react-native'

export class Wallet extends React.Component {
  static navigationOptions = {
    title: 'Wallet'
  };

  componentDidMount () {
    this.props.apiRequire(urls.profile)
  }

  renderCard (design) {
    const {navigation} = this.props
    const {amount, id, title, field_color: fieldColor} = design
    const formatted = accounting.formatMoney(parseFloat(amount))

    return (
      <TestElement
        parent={TouchableOpacity}
        label='test-id-cash-card'
        key={id}
        accessible={false}
        onPress={() => navigation.navigate('Value', design)}
        style={[styles.cardContainer, {backgroundColor: `#${fieldColor}`}]}>
        <View style={styles.cardDetails}>
          <View style={{
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingTop: 15,
            paddingHorizontal: 20}}>
            <Text style={{maxWidth: '55%', fontSize: 22, color: 'white'}}>
              {title}
            </Text>
            <Text style={{fontSize: 24, color: 'white'}}>{formatted}</Text>
          </View>
          <View style={styles.buttonRow}>
            <TestElement
              parent={TouchableOpacity}
              label='test-id-give-button'
              style={styles.cashButton}
              onPress={() => navigation.navigate('Give', design)}>
              <View style={{flexDirection: 'row', paddingBottom: 10}}>
                <Icon
                  style={{paddingRight: 8, paddingTop: 1.5}}
                  name="gift"
                  color="white"
                  size={20} />
                <Text style={{fontSize: 18, color: 'white'}}>Give Gift</Text>
              </View>
            </TestElement>
            <TestElement
              parent={TouchableOpacity}
              label='test-id-buy-button'
              style={styles.cashButton}
              onPress={() => navigation.navigate('Purchase', {design})}>
              <View style={{flexDirection: 'row', paddingBottom: 10}}>
                <Icon
                  style={{paddingRight: 8, paddingTop: 3}}
                  name="credit-card"
                  color="white"
                  size={18} />
                <Text style={{fontSize: 18, color: 'white'}}>Buy More</Text>
              </View>
            </TestElement>
          </View>
        </View>
      </TestElement>
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
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={() => this.props.apiRefresh(urls.profile)}
            />
          }>
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
      'You may lose your gift value if account recovery is not set up prior ' +
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
        <TestElement
          parent={TouchableOpacity}
          label='test-id-fab'
          style={styles.fab}
          onPress={() => navigation.navigate('Market')}>
          <Icon name="plus" color="white" size={24} />
        </TestElement>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  cardContainer: {
    flex: 1,
    flexDirection: 'row',
    marginHorizontal: 20,
    marginVertical: 10,
    height: 130,
    borderColor: 'lightgray',
    elevation: 1.8,
    shadowOffset: {width: 2, height: 2},
    shadowColor: 'lightgray',
    shadowOpacity: 1,
    borderRadius: 15
  },
  cardImage: {
    width: 130,
    height: 130,
    alignItems: 'center',
    justifyContent: 'center'
  },
  cardDetails: {
    justifyContent: 'space-between',
    flex: 1,
    flexDirection: 'column',
    borderLeftWidth: 0.5,
    borderColor: 'lightgray'
  },
  fab: {
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
    borderColor: Theme.lightBlue,
    elevation: 5,
    shadowOffset: {width: 2, height: 2},
    shadowColor: 'gray',
    shadowOpacity: 1
  },
  cashButton: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    height: 42,
    flex: 1,
    maxWidth: 150
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    paddingHorizontal: 20
  }
})

Wallet.propTypes = {
  amounts: PropTypes.array,
  apiRefresh: PropTypes.func.isRequired,
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
  apiRefresh,
  apiRequire,
  checkedUidPrompt
}

export default connect(mapStateToProps, mapDispatchToProps)(Wallet)
