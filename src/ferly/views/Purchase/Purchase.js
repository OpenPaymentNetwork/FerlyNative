import CashDisplay from 'ferly/components/CashDisplay'
import CurrencyInput from 'ferly/components/CurrencyInput'
import Spinner from 'ferly/components/Spinner'
import PropTypes from 'prop-types'
import React from 'react'
import Theme from 'ferly/utils/theme'
import {View, Text, Button} from 'react-native'
import {apiExpire, apiRequire} from 'ferly/store/api'
import {connect} from 'react-redux'
import {createUrl} from 'ferly/utils/fetch'

export class Purchase extends React.Component {
  static navigationOptions = {
    title: 'Purchase'
  };

  constructor (props) {
    super(props)
    this.state = {amount: 0, submitting: false}
  }

  componentDidMount () {
    this.props.apiRequire(this.props.walletUrl)
  }

  onPurchase () {
    const {navigation} = this.props
    const params = navigation.state.params
    const {design} = params
    const {amount} = this.state
    navigation.navigate('Cart', {amount, design})
  }

  render () {
    const params = this.props.navigation.state.params
    const {amount, submitting} = this.state
    const design = params.design || {}
    const amounts = this.props.amounts || []

    const found = amounts.find((cashRow) => {
      return cashRow.id === design.id
    })

    const displayAmount = found ? found.amount : 0

    return (
      <View style={{flex: 1, justifyContent: 'space-between'}}>
        <View>
          <CashDisplay design={design} />
          <View style={{paddingHorizontal: 30}}>
            <Text style={{color: 'gray'}}>Balance: ${displayAmount}</Text>
            <CurrencyInput callback={(value) => this.setState({amount: value})} />
          </View>
        </View>
        {submitting ? <Spinner /> : null}
        <Button
          title="Purchase"
          disabled={amount === 0 || submitting}
          color={Theme.darkBlue}
          onPress={this.onPurchase.bind(this)}
        />
        { // this.renderOffers()
        }
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

function mapStateToProps (state, ownProps) {
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
