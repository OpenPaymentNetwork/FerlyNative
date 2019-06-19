import PrimaryButton from 'ferly/components/PrimaryButton'
import PropTypes from 'prop-types'
import React from 'react'
import StatePicker from 'ferly/views/FerlyCard/StatePicker'
import Theme from 'ferly/utils/theme'
import {post} from 'ferly/utils/fetch'
import {MaterialIcons} from '@expo/vector-icons'
import {
  Alert,
  KeyboardAvoidingView,
  Text,
  TextInput,
  Platform,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  View
} from 'react-native'

export default class AddressForm extends React.Component {
    static navigationOptions = {
      title: 'Ferly Card'
    }

    constructor (props) {
      super(props)
      this.defaultState = 'UT'
      this.state = {
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
        zip_code: zipCode
      }
      post('request-card', params)
        .then((response) => response.json())
        .then((json) => {
          this.setState({submitting: false})
          if (this.validateSendCard(json)) {
            this.props.onPass()
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
        Alert.alert('Oops!', responseJson.description)
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
            <ScrollView>
              <View>
                <View style={styles.iconStyles}>
                  <MaterialIcons
                    style={{paddingRight: 10}}
                    name={'person'}
                    color={Theme.lightBlue}
                    size={20} />
                  <Text style={styles.labelText}>Name</Text>
                </View>
                <View style={styles.textBox}>
                  <TextInput
                    underlineColorAndroid='transparent'
                    style={styles.textField}
                    returnKeyType='done'
                    value={name}
                    maxLength={50}
                    onChangeText={(text) => this.setState({name: text})} />
                  <Text style={styles.error}>{nameError}</Text>
                </View>
              </View>
              <View>
                <View style={styles.iconStyles}>
                  <MaterialIcons
                    style={{paddingRight: 10}}
                    name={'location-on'}
                    color={Theme.lightBlue}
                    size={20} />
                  <Text style={styles.labelText}>Address</Text>
                </View>
                <View style={styles.textBox}>
                  <TextInput
                    underlineColorAndroid='transparent'
                    style={styles.textField}
                    returnKeyType='done'
                    value={address}
                    maxLength={50}
                    onChangeText={(text) => this.setState({address: text})} />
                  <Text style={styles.error}>{addressError}</Text>
                </View>
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.labelText}>Apartment Number</Text>
                <TextInput
                  underlineColorAndroid='transparent'
                  style={styles.textField}
                  returnKeyType='done'
                  value={apt}
                  onChangeText={(text) => this.setState({apt: text})}
                  maxLength={20} />
                <Text></Text>
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.labelText}>City</Text>
                <TextInput
                  underlineColorAndroid='transparent'
                  style={styles.textField}
                  returnKeyType='done'
                  value={city}
                  maxLength={15}
                  onChangeText={(text) => this.setState({city: text})} />
                <Text style={styles.error}>{cityError}</Text>
              </View>
              <View style={styles.stateZip}>
                <View>
                  <View>
                    <Text style={styles.labelText}>State</Text>
                  </View>
                  <View style={styles.iosPickerStyles}>
                    <StatePicker
                      defaultState={this.defaultState}
                      onStateChange={this.onStateChange} />
                    <Text style={styles.error}>{stateError}</Text>
                  </View>
                </View>
                <View>
                  <Text style={styles.labelText}>Zip Code</Text>
                  <TextInput
                    underlineColorAndroid='transparent'
                    style={styles.zipField}
                    keyboardType='numeric'
                    returnKeyType='done'
                    value={zipCode}
                    maxLength={5}
                    onChangeText={(text) => this.setState({zipCode: text})} />
                  <Text style={styles.error}>{zipError}</Text>
                </View>
              </View>
              <View style={styles.skipContainer}>
                <TouchableOpacity onPress={() => this.props.onPass()}>
                  <Text style={styles.enterCard}>
                    I already have a Ferly Card
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
          <PrimaryButton
            title="Submit"
            disabled={
              name === '' ||
              address === '' ||
              city === '' ||
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
  onPass: PropTypes.func.isRequired
}

const styles = StyleSheet.create({
  inputContainer: {paddingHorizontal: 10, paddingTop: 15, paddingLeft: 50},
  error: {color: 'red', width: '100%'},
  form: {flex: 1},
  textField: {borderBottomWidth: 1, borderColor: 'gray'},
  zipField: {borderBottomWidth: 1, borderColor: 'gray', width: 75},
  labelText: {color: 'gray'},
  textBox: {paddingHorizontal: 10, paddingLeft: 50},
  iconStyles: {flexDirection: 'row', paddingTop: 15, paddingLeft: 20},
  page: {flex: 1, justifyContent: 'space-between'},
  skipContainer: {flexDirection: 'row-reverse', zIndex: -1},
  enterCard: {
    color: Theme.lightBlue,
    paddingRight: 10,
    textDecorationLine: 'underline'
  },
  stateZip: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingTop: 15,
    marginLeft: 40
  },
  iosPickerStyles: {
    marginLeft: Platform.OS === 'ios' ? -25 : -5,
    borderBottomWidth: Platform.OS === 'ios' ? null : 1,
    borderColor: 'gray',
    marginRight: Platform.OS === 'ios' ? null : 20
  }
})
