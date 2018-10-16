import accounting from 'ferly/utils/accounting'
import BrainTree from 'ferly/views/Purchase/BrainTree'
import PropTypes from 'prop-types'
import React from 'react'
import Spinner from 'ferly/components/Spinner'
import {apiRequire, apiExpire} from 'ferly/store/api'
import {connect} from 'react-redux'
import {createUrl, post} from 'ferly/utils/fetch'
import {StackActions} from 'react-navigation'
import {View, Text, Alert} from 'react-native'

export class Cart extends React.Component {
  static navigationOptions = {
    title: 'Cart'
  };

  constructor (props) {
    super(props)
    this.state = {showBrainTree: true}
  }

  onSuccess (nonce) {
    const {navigation} = this.props
    const params = navigation.state.params
    const {design, amount} = params

    const purchaseParams = {
      amount: amount,
      design_id: design.id.toString(),
      nonce: nonce
    }

    this.setState({showBrainTree: false})

    post('create-purchase', purchaseParams)
      .then((response) => response.json())
      .then((responseJson) => {
        if (responseJson['result']) {
          this.props.apiExpire(createUrl('history'))
          this.props.apiExpire(createUrl('wallet'))
          const resetAction = StackActions.reset({
            index: 0,
            actions: [StackActions.push({routeName: 'Home'})]
          })
          navigation.dispatch(resetAction)
          const formatted = accounting.formatMoney(parseFloat(amount))
          const desc = `You added ${formatted} ${design.title} to your wallet.`
          Alert.alert('Complete!', desc)
        } else {
          Alert.alert(
            'Error',
            'There was a problem processing your credit card; please double ' +
            'check your payment information and try again.')
          this.setState({showBrainTree: true})
        }
      })
  }

  render () {
    const {params} = this.props.navigation.state
    const {amount, design} = params
    const formatted = accounting.formatMoney(parseFloat(amount))
    const {showBrainTree} = this.state

    const page = showBrainTree
      ? <BrainTree onSuccess={this.onSuccess.bind(this)} />
      : <Spinner />

    return (
      <View style={{flex: 1, flexDirection: 'column', backgroundColor: 'white'}}>
        <View style={{flexShrink: 1, justifyContent: 'space-between', flexDirection: 'row', padding: 18}}>
          <View>
            <Text style={{flexShrink: 1, fontWeight: 'bold', flexWrap: 'wrap', fontSize: 18}}>{design.title}</Text>
          </View>
          <Text style={{flexGrow: 1, fontWeight: 'bold', flexWrap: 'wrap', fontSize: 18, textAlign: 'right'}}>{formatted}</Text>
        </View>
        {page}
      </View>
    )
  }
}

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
