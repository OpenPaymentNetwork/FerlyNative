import accounting from 'ferly/utils/accounting'
import PrimaryButton from 'ferly/components/PrimaryButton'
import PropTypes from 'prop-types'
import React from 'react'
import SimpleCurrencyInput from 'ferly/components/SimpleCurrencyInput'
import Spinner from 'ferly/components/Spinner'
import Theme from 'ferly/utils/theme'
import {apiExpire, apiRequire} from 'ferly/store/api'
import {connect} from 'react-redux'
import {createUrl, post, urls} from 'ferly/utils/fetch'
import {StackActions} from 'react-navigation'
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View
} from 'react-native'

export class Give extends React.Component {
  static navigationOptions = {
    title: 'Give Gift'
  };

  constructor (props) {
    super(props)
    this.maxMessageLength = 400
    this.state = {amount: 0, error: '', submitting: false, message: ''}
  }

  componentDidMount () {
    this.props.apiRequire(this.props.walletUrl)
  }

  send () {
    const {navigation, apiExpire} = this.props
    const params = navigation.state.params
    const {design, user} = params
    const {title} = design
    const {first_name: firstName, last_name: lastName} = user
    const {amount, message} = this.state
    const formatted = accounting.formatMoney(parseFloat(amount))

    const postParams = {
      recipient_id: user.id.toString(),
      amount: amount,
      design_id: design.id.toString(),
      message: message
    }

    this.setState({submitting: true})
    post('send', postParams)
      .then((response) => response.json())
      .then((json) => {
        if (Object.keys(json).length === 0) {
          apiExpire(urls.history)
          apiExpire(createUrl('wallet'))
          const resetAction = StackActions.reset({
            index: 0,
            actions: [StackActions.push({routeName: 'Home'})]
          })
          navigation.dispatch(resetAction)
          Alert.alert(
            'Complete!',
            `You gifted ${formatted} ${title} to ${firstName} ${lastName}.`)
        } else {
          const error = json.invalid['amounts.0'] || json.invalid['amount']
          this.setState({error: error, amount: 0, submitting: false})
        }
      })
  }

  onChange (newAmount) {
    this.setState({amount: newAmount})
  }

  render () {
    const params = this.props.navigation.state.params
    const {design} = params
    const {amount, submitting, error, message} = this.state
    const amounts = this.props.amounts || []
    const fieldValue = accounting.formatMoney(parseFloat(amount))

    const found = amounts.find((cashRow) => {
      return cashRow.id === design.id
    })

    const foundAmount = found ? found.amount : 0
    const formatted = accounting.formatMoney(parseFloat(foundAmount))

    const counter = (
      <Text style={{color: 'lightgray'}}>
        {`${message.length}/${this.maxMessageLength}`}
      </Text>
    )

    return (
      <View style={{flex: 1, backgroundColor: 'white'}}>
        <View style={{flex: 1}}>
          <View style={styles.recipientRow}>
            <Text style={{fontSize: 20, fontWeight: 'bold'}}>Send</Text>
            <Text style={{fontSize: 20, fontWeight: 'bold', paddingLeft: 40}}>
              {`${params.user.first_name} ${params.user.last_name}`}
            </Text>
          </View>
          <View style={styles.designRow}>
            <View style={{flexShrink: 1, paddingVertical: 14}}>
              <Text style={styles.designTitle}>{design.title}</Text>
              <Text style={{color: 'gray'}}>Available: {formatted}</Text>
            </View>
            <SimpleCurrencyInput
              onChangeText={this.onChange.bind(this)}
              error={error} />
          </View>
          <View style={{paddingHorizontal: 20}}>
            <Text style={styles.messageTitle}>
              Add a message
            </Text>
            <TouchableWithoutFeedback
              onPress={() => this.messageInput.focus()}>
              <View style={{borderWidth: 0.5, padding: 6, minHeight: 100}}>
                <TextInput
                  ref={ref => (this.messageInput = ref)}
                  multiline
                  maxLength={this.maxMessageLength}
                  returnKeyType='done'
                  blurOnSubmit={true}
                  underlineColorAndroid={'transparent'}
                  onChangeText={(text) => this.setState({message: text})}
                  value={message} />
              </View>
            </TouchableWithoutFeedback>
            {message.length > this.maxMessageLength - 50 ? counter : null}
          </View>
          {submitting ? <Spinner /> : null}
        </View>
        <PrimaryButton
          title="Send"
          disabled={fieldValue === '$0.00' || submitting}
          color={Theme.lightBlue}
          onPress={this.send.bind(this)}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  recipientRow: {
    flexDirection: 'row',
    height: 60,
    paddingHorizontal: 20,
    borderBottomWidth: 0.5,
    borderColor: 'black',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  designRow: {
    flexShrink: 1,
    flexDirection: 'row',
    paddingHorizontal: 20,
    justifyContent: 'space-between'
  },
  designTitle: {
    flexShrink: 1,
    flexWrap: 'wrap',
    paddingRight: 20,
    fontWeight: 'bold',
    fontSize: 22
  },
  messageTitle: {fontSize: 14, color: Theme.lightBlue, marginBottom: 8}
})

Give.propTypes = {
  amounts: PropTypes.array,
  apiExpire: PropTypes.func.isRequired,
  apiRequire: PropTypes.func.isRequired,
  navigation: PropTypes.object.isRequired,
  walletUrl: PropTypes.string.isRequired
}

function mapStateToProps (state) {
  const walletUrl = createUrl('wallet')
  const apiStore = state.api.apiStore
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
