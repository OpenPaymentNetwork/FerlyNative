// import AwaitingCard from 'ferly/views/FerlyCard/AwaitingCard'
import PrimaryButton from 'ferly/components/PrimaryButton'
import PropTypes from 'prop-types'
import React from 'react'
import TestElement from 'ferly/components/TestElement'
import Theme from 'ferly/utils/theme'
import {connect} from 'react-redux'
import {post} from 'ferly/utils/fetch'
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
      title: 'Get a Ferly Card'
    }

    constructor (props) {
      super(props)
      this.state = {
        passed: false,
        submitting: false,
        assumedAbility: null,
        invalid: {},
        name: '',
        address: '',
        apt: '',
        city: '',
        state: undefined,
        zipCode: '',
        st: ''
      }
    }

    submitForm = () => {
      const {navigation} = this.props
      const {
        name,
        address,
        apt,
        city,
        state = this.defaultState,
        zipCode
      } = this.state
      this.setState({submitting: true})
      const params = {
        name: name,
        line1: address,
        line2: apt,
        city: city,
        state: state,
        zip_code: zipCode,
        verified: 'yes'
      }
      post('request-card', this.props.deviceId, params)
        .then((response) => response.json())
        .then((json) => {
          this.setState({submitting: false})
          if (this.validateSendCard(json)) {
            navigation.navigate('SignUpWaiting')
            const alertText = 'Your card will arrive in 7 to 10 business days.'
            Alert.alert('Done!', alertText)
          }
        })
    }

    onStateChange = (state) => {
      this.setState({state: state})
    }

    validateSendCard (responseJson) {
      if (responseJson.invalid) {
        this.setState({
          invalid: responseJson.invalid
        })
        return false
      } else if (responseJson.error) {
        Alert.alert('Oops!', 'We couldn\'t find that address. ' +
        'Check to make sure it\'s accurate.')
        return false
      } else {
        return true
      }
    }

    render () {
      const {navigation} = this.props
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
        <View style={styles.page}>
          <KeyboardAvoidingView style={styles.form}
            behavior={'padding'}
            keyboardVerticalOffset={64}>
            <ScrollView keyboardShouldPersistTaps='handled'>
              <TestElement parent={View} label='test-id-address-form'>
                <View>
                  <View style={styles.textBox}>
                    <TextInput
                      placeholder="Name"
                      underlineColorAndroid='transparent'
                      style={styles.textField}
                      returnKeyType='done'
                      value={name}
                      autoFocus={true}
                      maxLength={50}
                      onChangeText={(text) => this.setState({name: text})} />
                    <Text style={styles.error}>{nameError}</Text>
                  </View>
                </View>
                <View>
                  <View style={styles.textBox}>
                    <TextInput
                      placeholder="Address"
                      underlineColorAndroid='transparent'
                      style={styles.textField}
                      returnKeyType='done'
                      value={address}
                      maxLength={50}
                      onChangeText={
                        (text) => this.setState({address: text})
                      } />
                    <Text style={styles.error}>{addressError}</Text>
                  </View>
                </View>
                <View style={styles.textBox}>
                  <TextInput
                    placeholder="Apartment Number"
                    underlineColorAndroid='transparent'
                    style={styles.textField}
                    returnKeyType='done'
                    value={apt}
                    onChangeText={(text) => this.setState({apt: text})}
                    maxLength={20} />
                  <Text></Text>
                </View>
                <View style={styles.textBox}>
                  <TextInput
                    placeholder="City"
                    underlineColorAndroid='transparent'
                    style={styles.textField}
                    returnKeyType='done'
                    value={city}
                    maxLength={15}
                    onChangeText={(text) => this.setState({city: text})} />
                  <Text style={styles.error}>{cityError}</Text>
                </View>
                <View style={{flexDirection: 'row', marginBottom: 10}} >
                  <View style={styles.textBox}>
                    <TextInput
                      placeholder="St"
                      underlineColorAndroid='transparent'
                      style={styles.zipField}
                      returnKeyType='done'
                      value={state}
                      maxLength={15}
                      onChangeText={(text) => this.setState({state: text})} />
                    <Text style={styles.error}>{stateError}</Text>
                  </View>
                  <View style={styles.textBox}>
                    <TextInput
                      placeholder="Zip"
                      underlineColorAndroid='transparent'
                      style={styles.zipField}
                      keyboardType='numeric'
                      returnKeyType='done'
                      value={zipCode}
                      maxLength={5}
                      onChangeText={
                        (text) => this.setState({zipCode: text})
                      } />
                    <Text style={styles.error}>{zipError}</Text>
                  </View>
                </View>
                <PrimaryButton
                  title="Submit"
                  disabled={
                    name === '' ||
                    address === '' ||
                    city === '' ||
                    zipCode.length !== 5 ||
                    submitting
                  }
                  color={Theme.lightBlue}
                  onPress={this.submitForm}
                />
                <View style={{
                  width: '100%',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  marginBottom: 30}}>
                  <Text style={{fontSize: 16}}>Already have a Ferly Card?</Text>
                  <TouchableOpacity onPress={() => navigation.navigate('NewCardForm')}>
                    <Text style={{
                      color: Theme.lightBlue,
                      textDecorationLine: 'underline',
                      fontSize: 16,
                      paddingLeft: 5}}>Activate It</Text>
                  </TouchableOpacity>
                </View>
              </TestElement>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      )
    }
}

AddressForm.propTypes = {
  navigation: PropTypes.object,
  deviceId: PropTypes.string.isRequired
}

const styles = StyleSheet.create({
  error: {color: 'red', width: '100%'},
  form: {flex: 1},
  textField: {borderWidth: 1, height: 35, borderRadius: 5, paddingLeft: 10},
  labelText: {color: 'gray'},
  textBox: {paddingHorizontal: 10, paddingLeft: 20, paddingTop: 25},
  iconStyles: {flexDirection: 'row', paddingTop: 15, paddingLeft: 20},
  page: {flex: 1, justifyContent: 'space-between', backgroundColor: 'white'},
  zipField: {
    borderWidth: 1,
    width: 75,
    marginTop: 12,
    height: 35,
    borderRadius: 5,
    paddingLeft: 10
  }
})

function mapStateToProps (state) {
  const {deviceId} = state.settings
  return {
    deviceId
  }
}

export default connect(mapStateToProps)(AddressForm)
