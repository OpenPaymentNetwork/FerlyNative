import PropTypes from 'prop-types'
import React from 'react'
import {apiRequire, apiExpire} from 'ferly/store/api'
import {connect} from 'react-redux'
import {createUrl, post} from 'ferly/utils/fetch'
import {View, Text} from 'react-native'
import accounting from 'ferly/utils/accounting'
import BrainTree from 'ferly/views/Purchase/BrainTree'

export class Cart extends React.Component {
  static navigationOptions = {
    title: 'Cart'
  };

  componentDidMount () {
    // this.props.apiRequire(this.props.walletUrl)
  }

  onSuccess (responseJson) {
    const {navigation} = this.props
    const params = this.props.navigation.state.params
    const {design, amount} = params

    const purchaseParams = {
      amount: amount,
      design_id: design.id.toString()
    }

    post('purchase', purchaseParams)
      .then((response) => response.json())
      .then((responseJson) => {
        this.props.apiExpire(createUrl('history'))
        this.props.apiExpire(createUrl('wallet'))
        navigation.navigate('History')
      })
  }

  render () {
    const {params} = this.props.navigation.state
    const {amount, design} = params
    const formatted = accounting.formatMoney(parseFloat(amount))

    return (
      <View style={{flex: 1, flexDirection: 'column', backgroundColor: 'white'}}>
        <View style={{flexShrink: 1, justifyContent: 'space-between', flexDirection: 'row', padding: 18}}>
          <View>
            <Text style={{flexShrink: 1, fontWeight: 'bold', flexWrap: 'wrap', fontSize: 18}}>{design.title}</Text>
          </View>
          <Text style={{flexGrow: 1, fontWeight: 'bold', flexWrap: 'wrap', fontSize: 18, textAlign: 'right'}}>{formatted}</Text>
        </View>
        <BrainTree onSuccess={this.onSuccess.bind(this)} />
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
