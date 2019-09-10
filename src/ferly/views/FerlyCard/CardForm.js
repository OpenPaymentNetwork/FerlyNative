import React from 'react'
import PrimaryButton from 'ferly/components/PrimaryButton'
import Theme from 'ferly/utils/theme'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {apiRefresh} from 'ferly/store/api'
import {urls, post} from 'ferly/utils/fetch'
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet
} from 'react-native'

export class CardForm extends React.Component {
    static navigationOptions = {
      title: 'Activate Ferly Card'
    }

    constructor (props) {
      super(props)
      this.state = {
        pan: '',
        pin: '',
        invalid: {},
        submitting: false,
        assumedAbility: null,
        changingAbility: false,
        showNewPinModal: false
      }
    }

    componentWillUnmount () {
      const {assumedAbility} = this.state
      if (assumedAbility !== null) {
        this.props.apiRefresh(urls.profile)
      }
    }
    validateCardNumber (code) {
      var len = code.length
      var parity = len % 2
      var sum = 0
      for (var i = len - 1; i >= 0; i--) {
        var d = parseInt(code.charAt(i))
        if (i % 2 === parity) { d *= 2 }
        if (d > 9) { d -= 9 }
        sum += d
      }
      return sum % 10 === 0
    }

  onChangePan = (value) => {
    const withoutSpaces = value.replace(/\s/g, '')
    const {invalid} = this.state
    if (withoutSpaces.length === 16) {
      const newInvalid = Object.assign({}, invalid)
      if (!this.validateCardNumber(withoutSpaces)) {
        newInvalid.pan = 'Invalid card number'
      } else {
        delete newInvalid.pan
      }
      this.setState({invalid: newInvalid})
    }
    this.setState({pan: withoutSpaces})
  }

  onChangePin = (newPin) => {
    this.setState({pin: newPin})
  }

  submitForm = () => {
    const {pan, pin} = this.state
    this.setState({submitting: true})
    post('add-card', {pan, pin})
      .then((response) => response.json())
      .then((json) => {
        this.setState({submitting: false, pin: '', invalid: {}})
        if (this.validateAddCard(json)) {
          this.props.apiRefresh(urls.profile)
          const alertText = 'Your card is ready to use. Remember to select ' +
            'debit when using your card.'
          Alert.alert('Success', alertText)
        }
      })
  }

  validateAddCard = (json) => {
    if (json.invalid) {
      const newInvalid = json.invalid
      if (newInvalid['']) {
        newInvalid.pan = newInvalid['']
      }
      this.setState({invalid: newInvalid})
      return false
    } else {
      return json.result
    }
  }

  render () {
    const {pin, pan, invalid, submitting} = this.state
    const {pin: pinError, pan: panError} = invalid

    const instructions = 'Enter the 16-digit number found on the back of ' +
      'your Ferly Card and set a 4-digit PIN you\'ll remember later.'
    return (
      <View style={{flex: 1, backgroundColor: 'white'}}>
        <View style={{flex: 1, paddingVertical: 20, paddingHorizontal: 40}}>
          <View style={{paddingBottom: 10, alignItems: 'center'}}>
            <Text style={styles.title}>Add Card Information</Text>
            <Text style={styles.instructions}>{instructions}</Text>
          </View>
          <Text style={styles.labelText}>Card Number</Text>
          <View style={styles.inputContainer}>
            <TextInput
              underlineColorAndroid='transparent'
              keyboardType='numeric'
              maxLength={19}
              returnKeyType='done'
              onChangeText={this.onChangePan}
              value={pan.replace(/(.{4})/g, '$1 ').trim()} />
          </View>
          <Text style={styles.errorText}>{panError}</Text>
          <View style={{height: 10}} />
          <Text style={styles.labelText}>PIN</Text>
          <View style={[styles.inputContainer, {maxWidth: 100}]}>
            <TextInput
              underlineColorAndroid='transparent'
              keyboardType='numeric'
              maxLength={4}
              returnKeyType='done'
              onChangeText={this.onChangePin}
              value={pin} />
          </View>
          <Text style={styles.errorText}>{pinError}</Text>
        </View>
        <PrimaryButton
          title="Add"
          disabled={
            submitting ||
            pan.length !== 16 ||
            pin.length !== 4 ||
            !this.validateCardNumber(pan)
          }
          color={Theme.lightBlue}
          onPress={this.submitForm}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  cardContainer: {
    justifyContent: 'space-around',
    flexDirection: 'row',
    padding: 20
  },
  cardBackground: {height: 190, width: 300, flexDirection: 'row-reverse'},
  panText: {fontSize: 20, padding: 20, color: 'white'},
  inputContainer: {borderBottomWidth: 1, borderColor: 'gray'},
  title: {fontSize: 22, fontWeight: 'bold', color: Theme.darkBlue},
  errorText: {color: 'red'},
  labelText: {color: 'gray'},
  instructions: {
    fontSize: 16,
    paddingHorizontal: 6,
    paddingVertical: 10,
    color: Theme.darkBlue
  },
  actionsContainer: {
    marginHorizontal: 20,
    borderTopWidth: 0.5,
    borderTopColor: 'gray'
  },
  actionRow: {flexDirection: 'row', padding: 10, alignItems: 'center'},
  modalPage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  modalDialog: {
    backgroundColor: 'white',
    height: 160,
    width: 260,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10
  }
})

CardForm.propTypes = {
  navigation: PropTypes.object,
  apiRefresh: PropTypes.func.isRequired,
  card: PropTypes.object
}

function mapStateToProps (state) {
  const apiStore = state.api.apiStore
  const data = apiStore[urls.profile]
  const {cards} = data || {}
  let card
  if (cards) {
    card = cards[0]
  }
  return {
    loaded: !!data,
    card
  }
}

const mapDispatchToProps = {
  apiRefresh
}

export default connect(mapStateToProps, mapDispatchToProps)(CardForm)
