import React from 'react'
import Theme from 'ferly/utils/theme'
import {apiExpire} from 'ferly/store/api'
import {connect} from 'react-redux'
import {createUrl, post} from 'ferly/utils/fetch'
import {View, Text, Button} from 'react-native'
import PropTypes from 'prop-types'

class Offer extends React.Component {
  static navigationOptions = {
    title: 'Offer'
  }

  constructor (props) {
    super(props)
    this.state = {submitting: false, showError: false}
  }

  onPurchase () {
    const params = this.props.navigation.state.params
    const {offer} = params
    const {navigation, apiExpire} = this.props
    this.setState({submitting: true})

    const acceptParams = {
      offer_id: offer.id,
      option_id: offer.option_id
    }

    post('accept', acceptParams)
      .then((response) => response.json())
      .then((responseJson) => {
        if (responseJson['success']) {
          apiExpire(createUrl('wallet')) // but the drawer is dependent on this
          apiExpire(createUrl('history'))
          navigation.navigate('History')
        } else {
          this.setState({showError: true, submitting: false})
        }
      })
  }

  renderError () {
    return (
      <Text style={{color: 'red'}}>
        You are unable to purchase this offer.
      </Text>
    )
  }

  render () {
    const params = this.props.navigation.state.params
    const {offer} = params
    return (
      <View>
        <View style={{borderColor: 'black', borderBottomWidth: 1}}>
          <Text>{offer.title}</Text>
          <Text>You pay: ${offer.amount || 0}</Text>
          <Text>You get: ${offer.receive_amount}</Text>
        </View>
        <Button
          title="Purchase"
          disabled={this.state.submitting}
          color={Theme.darkBlue}
          onPress={this.onPurchase.bind(this)}
        />
        {this.renderError()}
      </View>
    )
  }
}

Offer.propTypes = {
  apiExpire: PropTypes.func.isRequired,
  navigation: PropTypes.object.isRequired
}

function mapStateToProps (state, ownProps) {
  return {
  }
}

const mapDispatchToProps = {
  apiExpire
}

export default connect(mapStateToProps, mapDispatchToProps)(Offer)
