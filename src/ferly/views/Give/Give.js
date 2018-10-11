import accounting from 'ferly/utils/accounting'
import SimpleCurrencyInput from 'ferly/components/SimpleCurrencyInput'
import Spinner from 'ferly/components/Spinner'
import PropTypes from 'prop-types'
import React from 'react'
import Theme from 'ferly/utils/theme'
import {View, Button, Text} from 'react-native'
import {apiExpire, apiRequire} from 'ferly/store/api'
import {connect} from 'react-redux'
import {createUrl, post} from 'ferly/utils/fetch'

export class Give extends React.Component {
  static navigationOptions = {
    title: 'Give Gift'
  };

  constructor (props) {
    super(props)
    this.state = {amount: 0, error: '', submitting: false}
  }

  componentDidMount () {
    this.props.apiRequire(this.props.walletUrl)
  }

  send (e, params) {
    e.preventDefault()
    const {navigation, apiExpire} = this.props
    this.setState({submitting: true})
    post('send', params)
      .then((response) => response.json())
      .then((responseJson) => {
        if (Object.keys(responseJson).length === 0) {
          apiExpire(createUrl('wallet')) // but the drawer is dependent on this
          apiExpire(createUrl('history'))
          navigation.navigate('History')
        } else {
          const error = responseJson['invalid']['amounts.0']
          this.setState({error: error, amount: 0, submitting: false})
        }
      })
  }

  onChange (newAmount) {
    this.setState({amount: newAmount})
  }

  render () {
    const params = this.props.navigation.state.params
    const {design, user} = params
    const {amount, submitting, error} = this.state
    const amounts = this.props.amounts || []
    const fieldValue = accounting.formatMoney(parseFloat(amount))

    const found = amounts.find((cashRow) => {
      return cashRow.id === design.id
    })

    const foundAmount = found ? found.amount : 0
    const formatted = accounting.formatMoney(parseFloat(foundAmount))

    const postParams = {
      recipient_id: user.id.toString(),
      amount: this.state.amount,
      design_id: design.id.toString()
    }

    return (
      <View style={{flex: 1, backgroundColor: 'white'}}>
        <View style={{flex: 1}}>
          <View style={{paddingHorizontal: 20, height: 60, justifyContent: 'space-between', flexDirection: 'row', borderWidth: 0.5, borderColor: 'black', alignItems: 'center'}}>
            <Text style={{fontSize: 20, fontWeight: 'bold'}}>Send</Text>
            <Text style={{fontSize: 20, fontWeight: 'bold', paddingLeft: 40}}>{params.user.title}</Text>
          </View>
          <View style={{flexShrink: 1, justifyContent: 'space-between', flexDirection: 'row', paddingHorizontal: 20}}>
            <View style={{flexShrink: 1, paddingVertical: 14}}>
              <Text style={{flexShrink: 1, fontWeight: 'bold', flexWrap: 'wrap', fontSize: 22, paddingRight: 20}}>{design.title}</Text>
              <Text style={{color: 'gray'}}>Available: {formatted}</Text>
            </View>
            <SimpleCurrencyInput onChangeText={this.onChange.bind(this)} error={error} />
          </View>
          {submitting ? <Spinner /> : null}
        </View>
        <Button
          title="Send"
          disabled={fieldValue === '$0.00' || submitting}
          color={Theme.lightBlue}
          style={{
            width: '100%',
            position: 'absolute',
            bottom: 0}}
          onPress={(e) => this.send(e, postParams)}
        />
      </View>
    )
  }
}

Give.propTypes = {
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

export default connect(mapStateToProps, mapDispatchToProps)(Give)
