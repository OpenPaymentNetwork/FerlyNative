import PropTypes from 'prop-types'
import React from 'react'
import Spinner from 'ferly/components/Spinner'
import PrimaryButton from 'ferly/components/PrimaryButton'
import Theme from 'ferly/utils/theme'
import {apiRequire, apiRefresh} from 'ferly/store/api'
import {connect} from 'react-redux'
import {ferlyCard} from 'ferly/images/index'
import {urls, post} from 'ferly/utils/fetch'
import {
  View,
  ImageBackground,
  Text,
  TextInput,
  Alert,
  StyleSheet
} from 'react-native'

export class FerlyCard extends React.Component {
  static navigationOptions = {
    title: 'Ferly Card'
  };

  constructor (props) {
    super(props)
    this.state = {
      pan: '',
      pin: '',
      invalid: {}
    }
  }

  componentDidMount () {
    this.props.apiRequire(urls.profile)
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

  onChangePan = (newPan) => {
    const {invalid} = this.state
    if (newPan.length === 16) {
      const newInvalid = Object.assign({}, invalid)
      if (!this.validateCardNumber(newPan)) {
        newInvalid.pan = 'Invalid card number'
      } else {
        delete newInvalid.pan
      }
      this.setState({invalid: newInvalid})
    }
    this.setState({pan: newPan})
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
        this.setState({submitting: false})
        if (this.validate(json)) {
          this.props.apiRefresh(urls.profile)
          Alert.alert('Success', 'Your card has been added!')
        }
      })
  }

  validate (json) {
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

  renderForm () {
    const {pin, pan, invalid, submitting} = this.state
    const {pin: pinError, pan: panError} = invalid
    return (
      <View style={{flex: 1, backgroundColor: 'white'}}>
        <View style={{flex: 1, padding: 10}}>
          <Text style={{fontSize: 18}}>Add a Ferly Card and set your PIN</Text>
          <TextInput
            underlineColorAndroid='transparent'
            keyboardType='numeric'
            maxLength={16}
            onChangeText={this.onChangePan}
            value={pan}
            placeholder={'Card Number'} />
          <Text style={{color: 'red'}}>{panError}</Text>
          <TextInput
            underlineColorAndroid='transparent'
            keyboardType='numeric'
            maxLength={4}
            onChangeText={this.onChangePin}
            value={pin}
            placeholder={'PIN'} />
          <Text style={{color: 'red'}}>{pinError}</Text>
        </View>
        <PrimaryButton
          title="Add Card"
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

  render () {
    const {card, loaded} = this.props
    if (!loaded) {
      return <Spinner />
    }

    if (!card) {
      return this.renderForm()
    }

    return (
      <View style={styles.cardContainer}>
        <ImageBackground style={{width: 300, height: 200}} source={ferlyCard}>
          <Text style={styles.panText}>{card.pan_redacted}</Text>
        </ImageBackground>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  cardContainer: {
    flex: 1,
    justifyContent: 'space-around',
    flexDirection: 'row',
    backgroundColor: 'white'
  },
  panText: {
    paddingLeft: 20,
    paddingTop: 10,
    fontSize: 22,
    color: Theme.lightBlue
  }
})

FerlyCard.propTypes = {
  apiRefresh: PropTypes.func.isRequired,
  apiRequire: PropTypes.func.isRequired,
  card: PropTypes.object,
  loaded: PropTypes.bool.isRequired
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
  apiRefresh,
  apiRequire
}

export default connect(mapStateToProps, mapDispatchToProps)(FerlyCard)
