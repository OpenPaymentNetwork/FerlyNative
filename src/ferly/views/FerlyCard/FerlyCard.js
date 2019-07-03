import AddressForm from 'ferly/views/FerlyCard/AddressForm'
import CardForm from 'ferly/views/FerlyCard/CardForm'
import PropTypes from 'prop-types'
import React from 'react'
import Spinner from 'ferly/components/Spinner'
import Theme from 'ferly/utils/theme'
import {apiRequire, apiRefresh} from 'ferly/store/api'
import {connect} from 'react-redux'
import {ferlyCard} from 'ferly/images/index'
import {Ionicons} from '@expo/vector-icons'
import {urls, post} from 'ferly/utils/fetch'
import {
  View,
  ImageBackground,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Modal
} from 'react-native'

export class FerlyCard extends React.Component {
  static navigationOptions = {
    title: 'Ferly Card'
  };

  constructor (props) {
    super(props)
    this.state = {
      invalid: {},
      submitting: false,
      assumedAbility: null,
      changingAbility: false,
      showNewPinModal: false,
      passed: false
    }
  }

  componentDidMount () {
    this.props.apiRequire(urls.profile)
  }

  componentWillUnmount () {
    const {assumedAbility} = this.state
    if (assumedAbility !== null) {
      this.props.apiRefresh(urls.profile)
    }
  }

  changeAbility = (requestedEnable) => {
    const urlTail = requestedEnable ? 'unsuspend-card' : 'suspend-card'
    const {card_id: cardId} = this.props.card
    const alertTitle = requestedEnable ? 'Card Enabled' : 'Card Disabled'
    const enabledMessage = 'Re-enabling your Ferly Card allows it to be ' +
      'used to spend your gift value.'
    const disabledMessage = 'While your Ferly Card is disabled it cannot be ' +
      'used to spend your gift value and its activity may appear fraudulent.'
    this.setState({assumedAbility: requestedEnable, changingAbility: true})
    Alert.alert(alertTitle, requestedEnable ? enabledMessage : disabledMessage)
    post(urlTail, {card_id: cardId})
      .then((response) => response.json())
      .then((json) => {
        this.setState({changingAbility: false})
      })
  }

  handleExpirationClick () {
    Alert.alert('Card Expiration',
      'This is your card\'s expiration date. A free replacement card can be ' +
      'requested after expiration. The underlying gift value held in your ' +
      'account does not expire unless permitted by applicable federal ' +
      'or state regulations. See a gift value page to view expiration ' +
      'dates, if any, for the gift value you hold.'
    )
  }

  handleChangePinClick = () => {
    this.setState({showNewPinModal: true})
  }

  removeCard = () => {
    const {card_id: cardId} = this.props.card
    post('delete-card', {card_id: cardId})
      .then((response) => response.json())
      .then((json) => {
        this.props.apiRefresh(urls.profile)
        this.setState({passed: false})
      })
  }

  submitNewPin = () => {
    const {card_id: cardId} = this.props.card
    const {pin} = this.state
    this.setState({submitting: true})
    post('change-pin', {card_id: cardId, pin: pin})
      .then((response) => response.json())
      .then((json) => {
        if (this.validateNewPin(json)) {
          this.setState({
            showNewPinModal: false,
            submitting: false,
            pin: '',
            invalid: {}
          })
          // Modal needs time to close, or it'll freeze on ios. Rn bug.
          setTimeout(() => {
            Alert.alert('Saved!', 'Your new pin is ready to use.')
          }, 300)
        }
      })
  }

  validateNewPin = (json) => {
    if (json.invalid) {
      this.setState({invalid: json.invalid, submitting: false})
      return false
    } else {
      return true
    }
  }

  handleRemoveCardClick = () => {
    Alert.alert('Remove Card',
      'Are you sure you want to remove this card? You\'ll need to activate ' +
      'a card before you can use your gift value.',
      [
        {text: 'Cancel', onPress: null},
        {text: 'Yes', onPress: this.removeCard}
      ]
    )
  }

  handleCloseModal = () => {
    this.setState({showNewPinModal: false, pin: '', invalid: {}})
  }

  render () {
    const {card, loaded} = this.props
    const {
      assumedAbility,
      changingAbility,
      showNewPinModal,
      pin,
      invalid,
      submitting,
      passed
    } = this.state
    const {pin: pinError} = invalid

    if (!loaded) {
      return <Spinner />
    }

    if (!card) {
      return passed
        ? <CardForm />
        : <AddressForm onPass={() => this.setState({passed: true})} />
    }

    const {suspended, expiration} = card
    let abilityValue = !suspended
    if (assumedAbility !== null) {
      abilityValue = assumedAbility
    }

    const splitExpiration = expiration.split('-')

    return (
      <View style={{flex: 1, backgroundColor: 'white'}}>
        <View style={styles.cardContainer}>
          <ImageBackground style={styles.cardBackground} source={ferlyCard}>
            <Text style={styles.panText}>
              **** {card.pan_redacted.substring(12, 16)}
            </Text>
          </ImageBackground>
        </View>
        <View style={styles.actionsContainer}>
          <View style={styles.actionRow}>
            <Ionicons
              name={abilityValue ? 'md-unlock' : 'md-lock'}
              color={Theme.darkBlue}
              size={26} />
            <Text style={{flex: 1, paddingLeft: 20, color: Theme.darkBlue}}>
              {abilityValue ? 'Enabled' : 'Disabled'}
            </Text>
            <Switch
              value={abilityValue}
              onValueChange={this.changeAbility}
              disabled={changingAbility} />
          </View>
          <TouchableOpacity
            onPress={this.handleExpirationClick}
            style={styles.actionRow}>
            <Ionicons name="md-calendar" color={Theme.darkBlue} size={24} />
            <View style={{flex: 1, paddingLeft: 20}}>
              <Text style={{color: Theme.darkBlue}}>Expiration Date</Text>
              <Text style={{color: Theme.darkBlue, fontSize: 12}}>
                {`${splitExpiration[1]}/${splitExpiration[0]}`}
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => this.setState({showNewPinModal: true})}
            style={styles.actionRow}>
            <Ionicons name="md-keypad" color={Theme.darkBlue} size={26} />
            <Text style={{flex: 1, paddingLeft: 20, color: Theme.darkBlue}}>
              Change PIN
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={this.handleRemoveCardClick}
            style={styles.actionRow}>
            <Ionicons name="md-trash" color={Theme.darkBlue} size={26} />
            <Text style={{flex: 1, paddingLeft: 20, color: Theme.darkBlue}}>
              Remove Card
            </Text>
          </TouchableOpacity>
          <Modal
            transparent={true}
            presentationStyle="overFullScreen"
            visible={showNewPinModal}
            onRequestClose={this.handleCloseModal}>
            <View style={styles.modalPage}>
              <View style={styles.modalDialog}>
                <Text style={{color: Theme.darkBlue, fontSize: 22}}>
                  Enter a new PIN
                </Text>
                <View>
                  <Text style={styles.labelText}>PIN</Text>
                  <View style={styles.inputContainer}>
                    <TextInput
                      underlineColorAndroid='transparent'
                      keyboardType='numeric'
                      maxLength={4}
                      autoFocus
                      editable={!submitting}
                      returnKeyType='done'
                      onChangeText={(text) => this.setState({pin: text})}
                      value={pin} />
                  </View>
                  <Text style={styles.errorText}>{pinError}</Text>
                </View>
                <View style={{flexDirection: 'row-reverse'}}>
                  <TouchableOpacity
                    style={{paddingVertical: 5, paddingHorizontal: 8}}
                    disabled={submitting}
                    onPress={this.submitNewPin}>
                    <Text style={{color: Theme.lightBlue}}>SUBMIT</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{paddingVertical: 5, paddingHorizontal: 8}}
                    disabled={submitting}
                    onPress={this.handleCloseModal}>
                    <Text style={{color: Theme.lightBlue}}>CANCEL</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </View>
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

FerlyCard.propTypes = {
  navigation: PropTypes.object,
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
