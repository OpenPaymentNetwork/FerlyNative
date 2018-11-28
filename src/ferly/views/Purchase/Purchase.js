import accounting from 'ferly/utils/accounting'
import PrimaryButton from 'ferly/components/PrimaryButton'
import PropTypes from 'prop-types'
import React from 'react'
import SimpleCurrencyInput from 'ferly/components/SimpleCurrencyInput'
import Spinner from 'ferly/components/Spinner'
import {apiExpire, apiRequire} from 'ferly/store/api'
import {connect} from 'react-redux'
import {createUrl} from 'ferly/utils/fetch'
import {View, Text} from 'react-native'

export class Purchase extends React.Component {
  static navigationOptions = {
    title: 'Purchase'
  };

  constructor (props) {
    super(props)
    this.state = {amount: 0, submitting: false, text: ''}
  }

  componentDidMount () {
    this.props.apiRequire(this.props.walletUrl)
  }

  onPurchase () {
    const {navigation} = this.props
    const params = navigation.state.params
    const {design} = params
    const amount = this.state.text
    navigation.navigate('Cart', {amount, design})
  }

  onChange (newAmount) {
    this.setState({text: newAmount})
  }

  render () {
    const params = this.props.navigation.state.params
    const {submitting, text} = this.state
    const design = params.design || {}
    const amounts = this.props.amounts || []

    const found = amounts.find((cashRow) => {
      return cashRow.id === design.id
    })

    const foundAmount = found ? found.amount : 0
    const formatted = accounting.formatMoney(parseFloat(foundAmount))
    const fieldValue = accounting.formatMoney(parseFloat(text))

    return (
      <View style={{flex: 1, justifyContent: 'space-between'}}>
        <View style={{flex: 1, flexDirection: 'column', backgroundColor: 'white'}}>
          <View style={{flexShrink: 1, justifyContent: 'space-between', flexDirection: 'row', paddingHorizontal: 18}}>
            <View style={{flexShrink: 1, paddingVertical: 14}}>
              <Text style={{flexShrink: 1, fontWeight: 'bold', flexWrap: 'wrap', fontSize: 22, paddingRight: 20}}>{design.title}</Text>
              <Text style={{color: 'gray'}}>Balance: {formatted}</Text>
            </View>
            <SimpleCurrencyInput onChangeText={this.onChange.bind(this)} />
          </View>
        </View>
        {submitting ? <Spinner /> : null}
        <PrimaryButton
          title="Checkout"
          disabled={fieldValue === '$0.00' || submitting}
          onPress={this.onPurchase.bind(this)}
        />
      </View>
    )
  }
}

Purchase.propTypes = {
  amounts: PropTypes.array,
  apiExpire: PropTypes.func.isRequired,
  apiRequire: PropTypes.func.isRequired,
  navigation: PropTypes.object.isRequired,
  walletUrl: PropTypes.string.isRequired
}

function mapStateToProps (state) {
  const walletUrl = createUrl('wallet')
  const apiStore = state.apiStore
  const myWallet = apiStore[walletUrl] || {}
  const {amounts} = myWallet
  return {
    amounts,
    walletUrl
  }
}

const mapDispatchToProps = {
  apiExpire,
  apiRequire
}

export default connect(mapStateToProps, mapDispatchToProps)(Purchase)
