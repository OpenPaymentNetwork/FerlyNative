import * as Permissions from 'expo-permissions'
import Constants from 'expo-constants'
import PrimaryButton from 'ferly/components/PrimaryButton'
import PropTypes from 'prop-types'
import React from 'react'
import Theme from 'ferly/utils/theme'
import {Notifications} from 'expo'
import {post} from 'ferly/utils/fetch'
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Platform
} from 'react-native'

export default class SignUp extends React.Component {
  static navigationOptions = {
    title: 'Sign Up for Ferly'
  };

  constructor (props) {
    super(props)
    this.state = {
      firstName: '',
      lastName: '',
      username: '',
      fieldValue: '',
      showUsernameError: false,
      invalid: {},
      expoToken: '',
      submitting: false
    }
  }

  componentDidMount () {
    this.getToken()
  }

  async getToken () {
    const { status: existingStatus } = await Permissions.getAsync(
      Permissions.NOTIFICATIONS
    )
    let finalStatus = existingStatus
    // only ask if permissions have not already been determined, because
    // iOS won't necessarily prompt a second time.
    if (existingStatus !== 'granted') {
      // Android remote notification permissions are granted during the app
      // install, so this will only ask on iOS
      const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS)
      finalStatus = status
    }

    if (finalStatus === 'granted') {
      let token = await Notifications.getExpoPushTokenAsync()
      this.setState({expoToken: token})
    }
  }

  handleSubmit () {
    const {firstName, lastName, username, fieldValue, expoToken} = this.state
    this.setState({submitting: true})
    const params = {
      first_name: firstName,
      last_name: lastName,
      username: username,
      login: fieldValue,
      expo_token: expoToken,
      os: `${Platform.OS}:${Platform.Version}`
    }

    post('signup', params)
      .then((response) => response.json())
      .then((responseJson) => {
        this.setState({submitting: false})
        if (this.validate(responseJson)) {
          this.props.navigation.navigate('SignUpCode', {}, {
            type: 'Navigate',
            routeName: 'SignUpCode',
            params: {param: 'param'}
          })
        }
      })
  }

  validate (responseJson) {
    if (responseJson.invalid) {
      this.setState({
        invalid: responseJson.invalid
      })
      return false
    } else if (responseJson.error === 'existing_username') {
      this.setState({invalid: {username: 'Username already taken'}})
      return false
    } else {
      return true
    }
  }

  invalidUsernameMessage (username) {
    let msg
    if (username.length < 4 || username.length > 20) {
      msg = 'Must be 4-20 characters long'
    } else if (!username.charAt(0).match('^[a-zA-Z]$')) {
      msg = 'Must start with a letter'
    } else if (!username.match('^[0-9a-zA-Z.]+$')) {
      msg = 'Must contain only letters, numbers, and periods'
    }
    return msg
  }

  validateUsername (username) {
    let msg = this.invalidUsernameMessage(username)
    if (msg) {
      const nextState = {username: username, invalid: {username: msg}}
      if (username.length > 3) {
        nextState.showUsernameError = true
      }
      this.setState(nextState)
    } else {
      const newInvalid = Object.assign({}, this.state.invalid)
      delete newInvalid.username
      this.setState({invalid: newInvalid})
    }
  }

  renderDebug () {
    const debug = false
    if (debug) {
      return (
        <View>
          <Text>
            device id: {Constants.deviceId}
          </Text>
          <Text>
            token: {this.state.expoToken}
          </Text>
        </View>
      )
    }
  }

  renderRecoveryOption () {
    const {navigation} = this.props
    return (
      <View style={[styles.row, {marginBottom: 30}]}>
        <Text style={{fontSize: 16}}>Already have an account?</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('RecoveryChannel')}>
          <Text style={[styles.recoveryText, {paddingLeft: 5}]}>Sign In</Text>
        </TouchableOpacity>
      </View>
    )
  }

  render () {
    const {firstName, lastName, username, submitting, fieldValue, invalid} = this.state
    return (
      <View style={{flex: 1, backgroundColor: 'white'}}>
        <View style={{flexDirection: 'row', paddingHorizontal: 15}} >
          <TextInput
            style={styles.firstField}
            underlineColorAndroid={'transparent'}
            placeholderTextColor={'gray'}
            placeholder='First Name'
            onChangeText={(text) => this.setState({firstName: text})}
            value={firstName} />
          {
            invalid.first_name
              ? (<Text style={styles.error}>{invalid.first_name}</Text>)
              : null
          }
          <TextInput
            style={styles.firstField}
            underlineColorAndroid={'transparent'}
            placeholderTextColor={'gray'}
            placeholder='Last Name'
            onChangeText={(text) => this.setState({lastName: text})}
            value={lastName} />
          {
            invalid.last_name
              ? (<Text style={styles.error}>{invalid.last_name}</Text>)
              : null
          }
        </View>
        <View>
          <View style={{paddingHorizontal: 15}} >
            <TextInput
              style={styles.field}
              underlineColorAndroid={'transparent'}
              placeholderTextColor={'gray'}
              placeholder='Username'
              onBlur={() => {
                this.validateUsername(username)
                this.setState({showUsernameError: true})
              }}
              onChangeText={
                (text) => {
                  this.validateUsername(text); this.setState({username: text})
                }
              }
              value={username} />
            {
              invalid.username && this.state.showUsernameError
                ? (<Text style={styles.error}>{invalid.username}</Text>)
                : null
            }
            <TextInput
              style={[styles.field, {marginBottom: 45}]}
              underlineColorAndroid={'transparent'}
              placeholderTextColor={'gray'}
              placeholder='Email Address or Phone Number'
              onChangeText={(text) => this.setState({fieldValue: text})}
              value={fieldValue} />
            {
              invalid.last_name
                ? (<Text style={styles.error}>{invalid.fieldValue}</Text>)
                : null
            }
            {this.renderDebug()}
          </View>
          <View style={{width: '100%'}} >
            <PrimaryButton
              title="Next"
              disabled={
                firstName === '' ||
                lastName === '' ||
                submitting ||
                !!invalid.username ||
                !username
              }
              color={Theme.lightBlue}
              onPress={this.handleSubmit.bind(this)} />
          </View>
          {this.renderRecoveryOption()}
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 5
  },
  error: {color: 'red', width: '100%'},
  field: {
    borderWidth: 1,
    borderRadius: 5,
    fontSize: 18,
    marginVertical: 15,
    width: '100%',
    height: 35,
    paddingLeft: 10
  },
  firstField: {
    borderWidth: 1,
    borderRadius: 5,
    fontSize: 18,
    marginBottom: 15,
    marginTop: 40,
    width: '50%',
    height: 35,
    paddingLeft: 10,
    justifyContent: 'space-between'
  },
  logo: {width: 160, height: 156, marginVertical: 40},
  recoveryText: {
    color: Theme.lightBlue,
    textDecorationLine: 'underline',
    fontSize: 16
  },
  row: {width: '100%', flexDirection: 'row', justifyContent: 'center'}
})

SignUp.propTypes = {
  navigation: PropTypes.object.isRequired,
  onFocus: PropTypes.object,
  onBlur: PropTypes.object
}
