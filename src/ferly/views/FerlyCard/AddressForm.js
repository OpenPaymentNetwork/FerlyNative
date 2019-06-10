import PrimaryButton from 'ferly/components/PrimaryButton'
import PropTypes from 'prop-types'
import React from 'react'
import Theme from 'ferly/utils/theme'
import {apiRequire, apiRefresh} from 'ferly/store/api'
import {connect} from 'react-redux'
import {urls, post} from 'ferly/utils/fetch'
import {
  Alert,
  KeyboardAvoidingView,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  View
} from 'react-native'

export class AddressForm extends React.Component {
    static navigationOptions = {
      title: 'Ferly Card'
    }

    constructor (props) {
      super(props)
      this.state = {
        submitting: false,
        adding: false,
        assumedAbility: null,
        invalid: {},
        name: '',
        address: '',
        apt: '',
        city: '',
        state: '',
        zipCode: ''
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

    submitForm = () => {
      const {name, address, apt, city, state, zipCode} = this.state
      this.setState({submitting: true})
      const params = {
        name: name,
        line1: address,
        line2: apt,
        city: city,
        state: state,
        zip_code: zipCode
      }
      post('request-card', params)
        .then((response) => response.json())
        .then((json) => {
          this.setState({submitting: false})
          if (this.validateSendCard(json)) {
            this.props.onPass()
            const alertText = 'You should receive your card in 7 to 10 days.'
            Alert.alert('Success', alertText)
          }
        })
    }

    validateSendCard (responseJson) {
      if (responseJson.invalid) {
        this.setState({
          invalid: responseJson.invalid
        })
        return false
      } else if (responseJson.error) {
        Alert.alert('Error', responseJson.description)
        return false
      } else {
        return true
      }
    }

    render () {
      const {
        name,
        address,
        apt,
        city,
        state,
        zipCode,
        invalid,
        submitting
      } = this.state
      const {
        name: nameError,
        line1: addressError,
        city: cityError,
        state: stateError,
        zipCode: zipError
      } = invalid
      return (
        <View style={{
          flex: 1,
          justifyContent: 'space-between'
        }}>
          <KeyboardAvoidingView style={styles.form}
            behavior="padding"
            keyboardVerticalOffset={100}>
            <ScrollView>
              <View style={styles.inputContainer}>
                <Text>Name</Text>
                <TextInput
                  underlineColorAndroid='transparent'
                  name="name"
                  label="Name"
                  placeholder="Name"
                  returnKeyType='done'
                  value={name}
                  maxLength={50}
                  onBlur={() => this.setState({showNameError: true})}
                  onChangeText={(text) => this.setState({name: text})} />
                <Text style={styles.error}>{nameError}</Text>
              </View>
              <View style={styles.inputContainer}>
                <Text>Address</Text>
                <TextInput
                  underlineColorAndroid='transparent'
                  name="address"
                  label="Address"
                  placeholder="Address"
                  returnKeyType='done'
                  value={address}
                  maxLength={50}
                  onBlur={() => this.setState({showAddressError: true})}
                  onChangeText={(text) => this.setState({address: text})} />
                <Text style={styles.error}>{addressError}</Text>
              </View>
              <View style={styles.inputContainer}>
                <Text>Apt Number</Text>
                <TextInput
                  underlineColorAndroid='transparent'
                  name="apt"
                  label="Apt #"
                  placeholder="Apt number"
                  returnKeyType='done'
                  value={apt}
                  onChangeText={(text) => this.setState({apt: text})}
                  maxLength={20} />
              </View>
              <View style={styles.inputContainer}>
                <Text>City</Text>
                <TextInput
                  underlineColorAndroid='transparent'
                  name="city"
                  label="City"
                  placeholder="City"
                  returnKeyType='done'
                  value={city}
                  maxLength={15}
                  onBlur={() => this.setState({showCityError: true})}
                  onChangeText={(text) => this.setState({city: text})} />
                <Text style={styles.error}>{cityError}</Text>
              </View>
              <View style={styles.inputContainer}>
                <Text>State</Text>
                <TextInput
                  underlineColorAndroid='transparent'
                  name="state"
                  label="State"
                  placeholder="State"
                  returnKeyType='done'
                  value={state}
                  maxLength={2}
                  onBlur={() => this.setState({showStateError: true})}
                  onChangeText={(text) => this.setState({state: text})} />
                <Text style={styles.error}>{stateError}</Text>
              </View>
              <View style={styles.inputContainer}>
                <Text>Zip Code</Text>
                <TextInput
                  underlineColorAndroid='transparent'
                  name="zipCode"
                  label="Zip Code"
                  placeholder="Zip Code"
                  keyboardType='numeric'
                  returnKeyType='done'
                  value={zipCode}
                  maxLength={5}
                  onBlur={() => this.setState({showZipError: true})}
                  onChangeText={(text) => this.setState({zipCode: text})} />
                <Text style={styles.error}>{zipError}</Text>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
          <View style={[{
            width: 100,
            height: 100,
            margin: 10,
            alignSelf: 'flex-end',
            position: 'absolute',
            bottom: 20,
            right: 10}]}>
            <TouchableOpacity onPress={() => this.props.onPass()}>
              <Text style={styles.enterCard}>Have a FerlyCard</Text>
            </TouchableOpacity>
          </View>
          <PrimaryButton
            title="Submit"
            disabled={
              name === '' ||
              address === '' ||
              city === '' ||
              state === '' ||
              zipCode === '' ||
              submitting
            }
            color={Theme.lightBlue}
            onPress={this.submitForm}
          />
        </View>
      )
    }
}

AddressForm.propTypes = {
  apiRefresh: PropTypes.func.isRequired,
  apiRequire: PropTypes.func.isRequired,
  card: PropTypes.object,
  onPass: PropTypes.func.isRequired
}

const styles = StyleSheet.create({
  inputContainer: {
    borderBottomWidth: 1,
    borderColor: 'gray'},
  error: {color: 'red', width: '100%'},
  form: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center'
  },
  enterCard: {
    backgroundColor: Theme.lightBlue,
    color: Theme.white
  }
})

function mapStateToProps (state) {
  const apiStore = state.api.apiStore
  const data = apiStore[urls.profile]
  const {cards} = data || {}
  let card
  if (cards) {
    card = cards[0]
  }
  return {
    card
  }
}

const mapDispatchToProps = {
  apiRefresh,
  apiRequire
}

export default connect(mapStateToProps, mapDispatchToProps)(AddressForm)
