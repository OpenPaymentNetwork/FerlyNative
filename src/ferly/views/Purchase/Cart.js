import accounting from 'ferly/utils/accounting'
import PrimaryButton from 'ferly/components/PrimaryButton'
import PropTypes from 'prop-types'
import React from 'react'
import Spinner from 'ferly/components/Spinner'
import Theme from 'ferly/utils/theme'
import {apiRequire, apiExpire} from 'ferly/store/api'
import {connect} from 'react-redux'
import {createUrl, post} from 'ferly/utils/fetch'
import {StackActions} from 'react-navigation'
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  WebView
} from 'react-native'

export class Cart extends React.Component {
  static navigationOptions = {
    title: 'Cart'
  };

  constructor (props) {
    super(props)
    this.state = {
      invalid: '',
      sources: null,
      selectedSource: null,
      cardLoaded: false
    }
  }

  componentDidMount () {
    fetch(createUrl('list-stripe-sources'))
      .then((response) => response.json())
      .then((json) => {
        const sources = json.sources.map((source) => {
          const {id, brand, last_four: lastFour} = source
          return {id, brand, lastFour}
        })
        this.setState({sources: sources})
      })
  }

  onSuccess (source) {
    const {navigation} = this.props
    const params = navigation.state.params
    const {design, amount} = params

    const purchaseParams = {
      amount: amount,
      design_id: design.id.toString(),
      stripe_source: source
    }

    post('purchase', purchaseParams)
      .then((response) => response.json())
      .then((responseJson) => {
        if (this.validate(responseJson)) {
          this.props.apiExpire(createUrl('history', {limit: 30}))
          this.props.apiExpire(createUrl('wallet'))
          const resetAction = StackActions.reset({
            index: 0,
            actions: [StackActions.push({routeName: 'Home'})]
          })
          navigation.dispatch(resetAction)
          const formatted = accounting.formatMoney(parseFloat(amount))
          const desc = `You added ${formatted} ${design.title} to your wallet.`
          Alert.alert('Complete!', desc)
        }
      })
  }

  validate (json) {
    if (json.invalid) {
      this.setState({
        invalid: json.invalid[Object.keys(json.invalid)[0]],
        submitting: false
      })
      return false
    } else if (!json.result) {
      Alert.alert('Error', 'There was a problem processing your credit card.')
      this.setState({submitting: false})
      return false
    } else {
      return true
    }
  }

  handleSubmitClick () {
    const {selectedSource} = this.state
    this.setState({submitting: true})
    if (selectedSource === 'new') {
      if (this.webview) {
        this.webview.injectJavaScript(
          "document.getElementById('submit-button').click()")
      }
    } else {
      this.onSuccess(selectedSource)
    }
  }

  receiveMessage (event) {
    const data = event.nativeEvent.data
    if (data.startsWith('paymenttoken:')) {
      const token = data.substring(data.indexOf(':') + 1)
      this.onSuccess(token)
    } else if (data === 'error') {
      this.setState({submitting: false})
    }
  }

  renderBody () {
    const {sources, selectedSource, cardLoaded} = this.state
    if (!sources) {
      return <Spinner />
    } else {
      const existingSources = sources.map((source) => {
        const {id, brand, lastFour} = source
        const sourceStyles = [styles.source]
        if (selectedSource === id) {
          sourceStyles.push(styles.selectedSource)
        }
        return (
          <TouchableOpacity
            key={id}
            style={sourceStyles}
            onPress={() => this.setState({selectedSource: id})}>
            <Text>{`${brand} ending in ${lastFour}`}</Text>
          </TouchableOpacity>
        )
      })
      let newCard = (
        <TouchableOpacity
          style={styles.source}
          onPress={() => this.setState({selectedSource: 'new'})}>
          <Text>Pay with a new card</Text>
        </TouchableOpacity>
      )
      if (selectedSource === 'new') {
        const stripeJs = `
          const stripe = Stripe('pk_test_OYUrHqvNNjYfoorvryuKvSA1');
          const elements = stripe.elements();
          const card = elements.create('card', {
            'style': {
              'base': {
                'fontSize': '16px'
              }
            }
          });
          card.mount('#card-number');
          card.addEventListener('change', ({error}) => {
            const displayError = document.getElementById('card-errors');
            displayError.textContent = error ? error.message : '';
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
          });`
        const loadingSpinner = <View style={{height: 80}}><Spinner /></View>
        newCard = (
          <View style={[styles.source, styles.selectedSource]}>
            <View style={{width: '100%', height: 80}}>
              {!cardLoaded ? loadingSpinner : null}
              <WebView
                ref={ref => (this.webview = ref)}
                onLoadEnd={() => this.setState({cardLoaded: true})}
                scalesPageToFit={Platform.OS !== 'ios'}
                source={require('./stripe.html')}
                injectedJavaScript={stripeJs}
                onMessage={this.receiveMessage.bind(this)}
                scrollEnabled={false} />
            </View>
          </View>
        )
      }
      return (
        <KeyboardAvoidingView
          style={{flex: 1}}
          behavior="padding"
          keyboardVerticalOffset={100}>
          <ScrollView contentContainerStyle={{flexGrow: 1}}>
            {existingSources}
            {newCard}
          </ScrollView>
        </KeyboardAvoidingView>
      )
    }
  }

  render () {
    const {params} = this.props.navigation.state
    const {amount, design} = params
    const formatted = accounting.formatMoney(parseFloat(amount))
    const {invalid, selectedSource, submitting} = this.state
    return (
      <View style={styles.page}>
        <View style={styles.designContainer}>
          <Text style={styles.designText}>{design.title}</Text>
          <View style={{flexGrow: 1, flexWrap: 'wrap'}}>
            <Text style={styles.amountText}>{formatted}</Text>
            <Text style={styles.invalidText}>{invalid}</Text>
          </View>
        </View>
        {this.renderBody()}
        <PrimaryButton
          title="Complete Purchase"
          disabled={!selectedSource || submitting}
          onPress={this.handleSubmitClick.bind(this)} />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  amountText: {fontSize: 18, fontWeight: 'bold', textAlign: 'right'},
  designContainer: {
    flexShrink: 1,
    backgroundColor: 'white',
    justifyContent: 'space-between',
    flexDirection: 'row',
    padding: 18
  },
  designText: {
    flexShrink: 1,
    fontWeight: 'bold',
    flexWrap: 'wrap',
    fontSize: 18
  },
  invalidText: {fontSize: 14, color: 'red', textAlign: 'right'},
  page: {flex: 1, flexDirection: 'column'},
  selectedSource: {borderColor: Theme.lightBlue, borderWidth: 2},
  source: {
    height: 90,
    marginHorizontal: 20,
    marginVertical: 10,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'lightgray',
    elevation: 1.8,
    shadowOffset: {width: 2, height: 2},
    shadowColor: 'lightgray',
    shadowOpacity: 1
  }
})

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
