import CashDisplay from 'ferly/components/CashDisplay'
import CurrencyInput from 'ferly/components/CurrencyInput'
import ProfileDisplay from 'ferly/components/ProfileDisplay'
import PropTypes from 'prop-types'
import React from 'react'
import Theme from 'ferly/utils/theme'
import {View, Text, Button} from 'react-native'
import {apiExpire} from 'ferly/store/api'
import {connect} from 'react-redux'
import {createUrl, post} from 'ferly/utils/fetch'

export class Give extends React.Component {
  static navigationOptions = {
    title: 'Give Gift'
  };

  constructor (props) {
    super(props)
    this.state = {amount: 0, submitting: false}
  }

  send (e, params) {
    e.preventDefault()
    const {navigation, apiExpire} = this.props
    this.setState({submitting: true})

    post('send', params).then((response) => {
      // TODO handle errors ex) sending more than available
      apiExpire(createUrl('wallet'))
      apiExpire(createUrl('history'))
      navigation.navigate('History')
    })
  }

  render () {
    const params = this.props.navigation.state.params
    const {design, user} = params
    const {amount, submitting} = this.state

    const postParams = {
      recipient_id: user.id.toString(),
      amount: this.state.amount,
      design_id: design.id.toString()
    }

    return (
      <View>
        <CashDisplay design={params.design} />
        <ProfileDisplay name={params.user.title} url={params.user.picture} />
        <Text>Select Amount</Text>
        <CurrencyInput callback={(value) => this.setState({amount: value})} />
        <Button
          title="Send"
          disabled={amount === 0 || submitting}
          color={Theme.darkBlue}
          onPress={(e) => this.send(e, postParams)}
        />
      </View>
    )
  }
}

Give.propTypes = {
  apiExpire: PropTypes.func.isRequired,
  navigation: PropTypes.object.isRequired
}

function mapStateToProps (state) {
  return {}
}

const mapDispatchToProps = {
  apiExpire
}

export default connect(mapStateToProps, mapDispatchToProps)(Give)
