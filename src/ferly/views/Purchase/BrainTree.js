import PropTypes from 'prop-types'
import React from 'react'
import Spinner from 'ferly/components/Spinner'
import {View, WebView} from 'react-native'
import {connect} from 'react-redux'
import {createUrl, post} from 'ferly/utils/fetch'

export class BrainTree extends React.Component {
  constructor (props) {
    super(props)
    this.state = {token: ''}
  }

  componentDidMount () {
    this.requestPaymentToken()
  }

  requestPaymentToken () {
    const url = createUrl('request-token')
    console.log('requesting token')
    fetch(url)
      .then((response) => response.json())
      .then((responseJson) => {
        this.setState({token: responseJson['token']})
      })
      .catch((error) => {
        console.error(error)
      })
  }

  receiveMessage (event) {
    const data = event.nativeEvent.data
    if (data.startsWith('paymentnonce:')) {
      const nonce = data.substring(data.indexOf(':') + 1)
      post('create-purchase', {nonce: nonce})
        .then((response) => response.json())
        .then((responseJson) => {
          if (responseJson['result']) {
            this.props.onSuccess(responseJson)
          }
        })
    }
  }

  createBrainTreeJS () {
    return `
      var button = document.querySelector('#submit-button');
      braintree.dropin.create({
        authorization: '${this.state.token}',
        vaultManager: true,
        container: '#dropin-container'
      }, function (createErr, instance) {
        button.addEventListener('click', function () {
          instance.requestPaymentMethod(
            function (requestPaymentMethodErr, payload) {
              window.postMessage('paymentnonce:' + payload.nonce);
          });
        });
      });
    `
  }

  render () {
    const {token} = this.state

    let body
    if (token) {
      body = (
        <WebView
          onMessage={this.receiveMessage.bind(this)}
          source={require('./drop-in.html')}
          injectedJavaScript={this.createBrainTreeJS()}
          style={{ flex: 1 }} />
      )
    } else {
      body = <Spinner />
    }

    return (
      <View
        style={{
          flex: 1
        }}>
        {body}
      </View>
    )
  }
}

BrainTree.propTypes = {
  onSuccess: PropTypes.func.isRequired
}

function mapStateToProps (state) {
  return {}
}

const mapDispatchToProps = {
}

export default connect(mapStateToProps, mapDispatchToProps)(BrainTree)
