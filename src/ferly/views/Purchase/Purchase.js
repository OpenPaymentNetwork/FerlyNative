import CashDisplay from 'ferly/components/CashDisplay'
import CurrencyInput from 'ferly/components/CurrencyInput'
import PropTypes from 'prop-types'
import React from 'react'
import Theme from 'ferly/utils/theme'
import {View, Text, Button} from 'react-native'
import {apiExpire} from 'ferly/store/api'
import {connect} from 'react-redux'
import {createUrl, post} from 'ferly/utils/fetch'

export class Purchase extends React.Component {
  static navigationOptions = {
    title: 'Purchase'
  };

  constructor (props) {
    super(props)
    this.state = {amount: 0, submitting: false}
  }

  onPurchase () {
    const params = this.props.navigation.state.params
    const {design} = params
    const {navigation, apiExpire} = this.props
    this.setState({submitting: true})

    const purchaseParams = {
      amount: this.state.amount,
      design_id: design.id.toString()
    }

    post('purchase', purchaseParams)
      .then((response) => response.json())
      .then((responseJson) => {
        apiExpire(createUrl('history'))
        apiExpire(createUrl('wallet'))
        navigation.navigate('History')
      })
  }

  render () {
    const params = this.props.navigation.state.params
    const {amount, submitting} = this.state
    const {design} = params

    return (
      <View>
        <CashDisplay design={design} />
        <Text>Select Amount</Text>
        <CurrencyInput callback={(value) => this.setState({amount: value})} />
        <Button
          title="Purchase"
          disabled={amount === 0 || submitting}
          color={Theme.darkBlue}
          onPress={this.onPurchase.bind(this)}
        />
      </View>
    )
  }
}

Purchase.propTypes = {
  apiExpire: PropTypes.func.isRequired,
  navigation: PropTypes.object.isRequired
}

function mapStateToProps (state) {
  return {
  }
}

const mapDispatchToProps = {
  apiExpire
}

export default connect(mapStateToProps, mapDispatchToProps)(Purchase)
