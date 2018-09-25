import CashDisplay from 'ferly/components/CashDisplay'
import CurrencyInput from 'ferly/components/CurrencyInput'
import ProfileDisplay from 'ferly/components/ProfileDisplay'
import Spinner from 'ferly/components/Spinner'
import PropTypes from 'prop-types'
import React from 'react'
import Theme from 'ferly/utils/theme'
import {View, Button} from 'react-native'
import {apiExpire} from 'ferly/store/api'
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
      <View style={{flex: 1}}>
        <View style={{flex: 1}}>
          <CashDisplay design={params.design} />
          <ProfileDisplay name={params.user.title} url={params.user.picture} />
          <View style={{paddingHorizontal: 30}}>
            <CurrencyInput
              error={this.state.error}
              callback={(value) => this.setState({amount: value})} />
          </View>
          {submitting ? <Spinner /> : null}
        </View>
        <Button
          title="Send"
          disabled={amount === 0 || submitting}
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
