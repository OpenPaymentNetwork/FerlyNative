import PrimaryButton from 'ferly/components/PrimaryButton'
import PropTypes from 'prop-types'
import React from 'react'

import {
  View,
  WebView,
  Platform
} from 'react-native'

export default class Stripe extends React.Component {
  constructor (props) {
    super(props)
    this.state = {loaded: false, submitting: false}
  }

  receiveMessage (event) {
    const data = event.nativeEvent.data
    if (data.startsWith('paymenttoken:')) {
      const token = data.substring(data.indexOf(':') + 1)
      this.props.onSuccess(token)
      this.setState({submitting: false})
    } else if (data === 'error') {
      this.setState({submitting: false})
    }
  }

  stripeJS () {
    return `
      const stripe = Stripe('pk_test_OYUrHqvNNjYfoorvryuKvSA1');
      const elements = stripe.elements();
      const card = elements.create('card');
      card.mount('#card-number');
      card.addEventListener('change', ({error}) => {
        const displayError = document.getElementById('card-errors');
        if (error) {
          displayError.textContent = error.message;
        } else {
          displayError.textContent = '';
        }
      });
      const form = document.getElementById('submit-button');
      form.addEventListener('click', async (event) => {
        event.preventDefault();
        const {token, error} = await stripe.createToken(card);
        if (error) {
          const errorElement = document.getElementById('card-errors');
          errorElement.textContent = error.message;
          window.postMessage('error')
        } else {
          window.postMessage('paymenttoken:' + token.id);
        }
      });
    `
  }

  buttonCallback () {
    if (this.webview) {
      this.setState({submitting: true})
      this.webview.injectJavaScript(
        "document.getElementById('submit-button').click()")
    }
  }

  render () {
    const {loaded, submitting} = this.state
    return (
      <View style={{flex: 1}}>
        <WebView
          ref={ref => (this.webview = ref)}
          onLoadEnd={() => this.setState({loaded: true})}
          scalesPageToFit={Platform.OS !== 'ios'}
          source={require('./stripe.html')}
          injectedJavaScript={this.stripeJS()}
          onMessage={this.receiveMessage.bind(this)}
          style={{flex: 1}} />
        <PrimaryButton
          title="Complete Purchase"
          disabled={!loaded || submitting}
          onPress={this.buttonCallback.bind(this)}
        />
      </View>
    )
  }
}

Stripe.propTypes = {
  onSuccess: PropTypes.func.isRequired
}
