import CashDisplay from 'ferly/components/CashDisplay'
import CurrencyInput from 'ferly/components/CurrencyInput'
import Spinner from 'ferly/components/Spinner'
import PropTypes from 'prop-types'
import React from 'react'
import Theme from 'ferly/utils/theme'
import {View, Text, Button, TouchableOpacity} from 'react-native'
import {apiExpire, apiRequire} from 'ferly/store/api'
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

  componentDidMount () {
    // this.props.apiRequire(this.props.designUrl)
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
        // TODO handle errors
        apiExpire(createUrl('history'))
        apiExpire(createUrl('wallet'))
        navigation.navigate('History')
      })
  }

  // renderOffers () {
  //   const offers = this.props.offers || []
  //   return offers.map((offer) => {
  //     return (
  //       <TouchableOpacity
  //         key={offer.id}
  //         onPress={() => this.props.navigation.navigate('Offer', {offer})}>
  //         <View style={{borderColor: 'black', borderBottomWidth: 1}}>
  //           <Text>{offer.title}</Text>
  //           <Text>You pay: ${offer.amount || 0}</Text>
  //           <Text>You get: ${offer.receive_amount}</Text>
  //         </View>
  //       </TouchableOpacity>
  //     )
  //   })
  // }

  render () {
    const params = this.props.navigation.state.params
    const {amount, submitting} = this.state
    const {design} = params

    return (
      <View style={{flex: 1, justifyContent: 'space-between'}}>
        <View>
          <CashDisplay design={design} />
          <View style={{paddingHorizontal: 30}}>
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
  apiExpire: PropTypes.func.isRequired,
  navigation: PropTypes.object.isRequired
}

function mapStateToProps (state, ownProps) {
  // const params = ownProps.navigation.state.params
  // const {design} = params
  // const designUrl = createUrl('design', {design_id: design.id})
  // const apiStore = state.apiStore
  // const {offers} = apiStore[designUrl] || {}
  return {
    // designUrl: designUrl,
    // offers: offers
  }
}

const mapDispatchToProps = {
  apiExpire
  // apiRequire
}

export default connect(mapStateToProps, mapDispatchToProps)(Purchase)
