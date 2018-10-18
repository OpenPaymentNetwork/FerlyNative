import PrimaryButton from 'ferly/components/PrimaryButton'
import PropTypes from 'prop-types'
import React from 'react'
import Spinner from 'ferly/components/Spinner'
import Theme from 'ferly/utils/theme'
import {createUrl} from 'ferly/utils/fetch'
import {
  View,
  WebView,
  Platform,
  Button,
  ScrollView,
  KeyboardAvoidingView
} from 'react-native'

export default class BrainTree extends React.Component {
  constructor (props) {
    super(props)
    this.state = {token: '', loaded: false}
  }

  componentDidMount () {
    this.requestPaymentToken()
  }

  requestPaymentToken () {
    const url = createUrl('request-token')
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
      this.props.onSuccess(nonce)
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

  buttonCallback () {
    if (this.webview) {
      this.webview.injectJavaScript(
        "document.getElementById('submit-button').click()")
    }
  }

  render () {
    const {token} = this.state

    let body
    if (token) {
      body = (
        <WebView
          ref={ref => (this.webview = ref)}
          scalesPageToFit={Platform.OS !== 'ios'}
          source={require('./drop-in.html')}
          injectedJavaScript={this.createBrainTreeJS()}
          onMessage={this.receiveMessage.bind(this)}
          onLoadEnd={() => this.setState({loaded: true})}
          // onError={console.error.bind(console, 'error')}
          // bounces={false}
          // onShouldStartLoadWithRequest={() => true}
          // javaScriptEnabledAndroid={true}
          // startInLoadingState={true}
          style={{flex: 1}} />
      )
      if (Platform.OS !== 'ios') {
        body = (
          <KeyboardAvoidingView
            style={{flex: 1}}
            behavior="padding"
            keyboardVerticalOffset={100}>
            <ScrollView contentContainerStyle={{flexGrow: 1}}>
              {body}
            </ScrollView>
          </KeyboardAvoidingView>
        )
      }
    } else {
      body = <Spinner />
    }

    return (
      <View
        style={{
          flex: 1
        }}>
        {body}
        <PrimaryButton
          title="Complete Purchase"
          disabled={!this.state.loaded}
          onPress={this.buttonCallback.bind(this)}
        />
      </View>
    )
  }
}

BrainTree.propTypes = {
  onSuccess: PropTypes.func.isRequired
}
