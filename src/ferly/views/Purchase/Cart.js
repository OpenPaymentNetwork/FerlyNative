import accounting from 'ferly/utils/accounting'
import Icon from 'react-native-vector-icons/FontAwesome'
import PrimaryButton from 'ferly/components/PrimaryButton'
import PropTypes from 'prop-types'
import React from 'react'
import Spinner from 'ferly/components/Spinner'
import Theme from 'ferly/utils/theme'
import {apiRequire, apiExpire, apiRefresh} from 'ferly/store/api'
import {connect} from 'react-redux'
import {Constants} from 'expo'
import {createUrl, post, urls} from 'ferly/utils/fetch'
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
      selectedSource: null,
      cardLoaded: false
    }
  }

  componentDidMount () {
    this.props.apiRequire(this.props.sourcesUrl)
  }

  onSuccess (source) {
    const {navigation} = this.props
    const params = navigation.state.params
    const {design, amount} = params

    const purchaseParams = {
      amount: amount,
      fee: design.fee,
      design_id: design.id.toString(),
      source_id: source
    }

    post('purchase', purchaseParams)
      .then((response) => response.json())
      .then((responseJson) => {
        if (this.validate(responseJson)) {
          this.props.apiExpire(urls.history)
          this.props.apiExpire(urls.profile)
          const resetAction = StackActions.reset({
            index: 0,
            actions: [StackActions.push({routeName: 'Home'})]
          })
          navigation.dispatch(resetAction)
          const formatted = accounting.formatMoney(parseFloat(amount))
          const desc = `You added ${formatted} ${design.title} to your wallet.`
          Alert.alert('Complete!', desc)
          this.props.apiExpire(this.props.sourcesUrl)
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

  handleRemoveClick (sourceId, card) {
    Alert.alert(
      'Confirm',
      `Are you sure you'd like to remove ${card}?`,
      [
        {text: 'No', onPress: null},
        {text: 'Yes', onPress: () => this.removeCard(sourceId)}
      ]
    )
  }

  removeCard (sourceId) {
    if (this.state.selectedSource === sourceId) {
      this.setState({selectedSource: null})
    }
    fetch(createUrl('delete-stripe-source', {source_id: sourceId}))
      .then((response) => response.json())
      .then((json) => {
        this.props.apiRefresh(this.props.sourcesUrl)
      })
  }

  renderBody () {
    const {selectedSource, cardLoaded} = this.state
    const {sources} = this.props
    if (!sources) {
      return <Spinner />
    } else {
      const existingSources = sources.map((source) => {
        const {id, brand, lastFour} = source
        const sourceStyles = [styles.source]
        if (selectedSource === id) {
          sourceStyles.push(styles.selectedSource)
        }
        const display = `${brand} ending in ${lastFour}`
        return (
          <TouchableOpacity
            key={id}
            style={sourceStyles}
            onPress={() => this.setState({selectedSource: id})}>
            <Text>{display}</Text>
            <TouchableOpacity
              style={styles.removeIconContainer}
              onPress={() => this.handleRemoveClick(id, display)}>
              <Icon
                style={{alignSelf: 'flex-start'}}
                name="times"
                color="lightcoral"
                size={18} />
            </TouchableOpacity>
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
        const {releaseChannel} = Constants.manifest
        const publishableKey = releaseChannel === 'production'
          ? 'pk_live_8U9wUmhgzP48MMlF8QS82TLb'
          : 'pk_test_OYUrHqvNNjYfoorvryuKvSA1'
        const stripeJs = `
          const stripe = Stripe('${publishableKey}');
          const elements = stripe.elements();
          const card = elements.create('card', {
            'style': {
              'base': {'fontSize': '16px'}
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
    const {amount: amountString, design} = params
    const fee = parseFloat(design.fee)
    const formatted = accounting.formatMoney(parseFloat(amountString))
    const amount = accounting.parse(formatted)
    const {invalid, selectedSource, submitting} = this.state
    return (
      <View style={styles.page}>
        <View style={styles.designContainer}>
          <Text style={styles.designText}>{design.title}</Text>
          <View style={{flexGrow: 1, flexWrap: 'wrap'}}>
            <Text style={styles.amountText}>{formatted}</Text>
            <Text style={
              [styles.amountText, {textDecorationLine: 'underline'}]
            }>
              + {accounting.formatMoney(fee)}
            </Text>
            <Text style={[styles.amountText, {fontWeight: 'bold'}]}>
              {accounting.formatMoney(amount + fee)}
            </Text>
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
  amountText: {fontSize: 18, textAlign: 'right'},
  feeText: {
    fontSize: 18, textAlign: 'right', textDecorationLine: 'underline'},
  totalText: {fontSize: 18, fontWeight: 'bold', textAlign: 'right'},
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
  },
  removeIconContainer: {
    alignSelf: 'flex-end',
    position: 'absolute',
    height: 90,
    padding: 10
  }
})

Cart.propTypes = {
  amounts: PropTypes.array,
  apiExpire: PropTypes.func.isRequired,
  apiRefresh: PropTypes.func.isRequired,
  apiRequire: PropTypes.func.isRequired,
  navigation: PropTypes.object.isRequired,
  sources: PropTypes.array,
  sourcesUrl: PropTypes.string.isRequired
}

function mapStateToProps (state) {
  const sourcesUrl = createUrl('list-stripe-sources')
  const apiStore = state.api.apiStore
  const sourcesResponse = apiStore[sourcesUrl] || {}
  const {sources: sourcesList} = sourcesResponse
  let sources
  if (sourcesList) {
    sources = sourcesList.map((source) => {
      const {id, brand, last_four: lastFour} = source
      return {id, brand, lastFour}
    })
  }

  return {
    sourcesUrl,
    sources
  }
}

const mapDispatchToProps = {
  apiExpire,
  apiRefresh,
  apiRequire
}

export default connect(mapStateToProps, mapDispatchToProps)(Cart)
