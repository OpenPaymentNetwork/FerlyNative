import accounting from 'ferly/utils/accounting'
import Stripe from 'ferly/views/Purchase/Stripe'
import PropTypes from 'prop-types'
import React from 'react'
import {apiRequire, apiExpire} from 'ferly/store/api'
import {connect} from 'react-redux'
import {createUrl, post} from 'ferly/utils/fetch'
import {StackActions} from 'react-navigation'
import {View, Text, Alert, StyleSheet} from 'react-native'

export class Cart extends React.Component {
  static navigationOptions = {
    title: 'Cart'
  };

  constructor (props) {
    super(props)
    this.state = {invalid: ''}
  }

  onSuccess (token) {
    const {navigation} = this.props
    const params = navigation.state.params
    const {design, amount} = params

    const purchaseParams = {
      amount: amount,
      design_id: design.id.toString(),
      stripe_token: token
    }

    post('purchase', purchaseParams)
      .then((response) => response.json())
      .then((responseJson) => {
        if (this.validate(responseJson)) {
          this.props.apiExpire(createUrl('history', {limit: 30}))
          this.props.apiExpire(createUrl('wallet'))
          const resetAction = StackActions.reset({
            index: 0,
            actions: [StackActions.push({routeName: 'Home'})]
          })
          navigation.dispatch(resetAction)
          const formatted = accounting.formatMoney(parseFloat(amount))
          const desc = `You added ${formatted} ${design.title} to your wallet.`
          Alert.alert('Complete!', desc)
        }
      })
  }

  validate (json) {
    if (json.invalid) {
      this.setState({invalid: json.invalid[Object.keys(json.invalid)[0]]})
      return false
    } else if (!json.result) {
      Alert.alert('Error', 'There was a problem processing your credit card.')
      return false
    } else {
      return true
    }
  }

  render () {
    const {params} = this.props.navigation.state
    const {amount, design} = params
    const formatted = accounting.formatMoney(parseFloat(amount))
    const {invalid} = this.state

    return (
      <View style={styles.page}>
        <View style={styles.designContainer}>
          <Text style={styles.designText}>{design.title}</Text>
          <View style={{flexGrow: 1, flexWrap: 'wrap'}}>
            <Text style={styles.amountText}>{formatted}</Text>
            <Text style={styles.invalidText}>{invalid}</Text>
          </View>
        </View>
        <Stripe onSuccess={this.onSuccess.bind(this)} />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  amountText: {fontSize: 18, fontWeight: 'bold', textAlign: 'right'},
  designContainer: {
    flexShrink: 1,
    justifyContent: 'space-between',
    flexDirection: 'row',
    padding: 18
  },
  designText: {
    flexShrink: 1,
    fontWeight: 'bold',
    flexWrap: 'wrap',
    fontSize: 18
  },
  invalidText: {fontSize: 14, color: 'red', textAlign: 'right'},
  page: {flex: 1, flexDirection: 'column', backgroundColor: 'white'}
})

Cart.propTypes = {
  amounts: PropTypes.array,
  apiRequire: PropTypes.func.isRequired,
  apiExpire: PropTypes.func.isRequired,
  navigation: PropTypes.object.isRequired
}

function mapStateToProps (state) {
  return {}
}

const mapDispatchToProps = {
  apiRequire,
  apiExpire
}

export default connect(mapStateToProps, mapDispatchToProps)(Cart)
