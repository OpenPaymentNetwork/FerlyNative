import * as Permissions from 'expo-permissions'
import Constants from 'expo-constants'
import PrimaryButton from 'ferly/components/PrimaryButton'
import PropTypes from 'prop-types'
import React from 'react'
import Theme from 'ferly/utils/theme'
import {logoWhite} from 'ferly/images/index'
import {Notifications} from 'expo'
import {post, envId} from 'ferly/utils/fetch'
import {
  View,
  Text,
  TextInput,
  Image,
  StyleSheet,
  TouchableOpacity,
  Platform
} from 'react-native'

export default class SignUp extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      firstName: '',
      lastName: '',
      username: '',
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
    const {firstName, lastName, username, expoToken} = this.state
    const {navigation} = this.props
    this.setState({submitting: true})
    const params = {
      first_name: firstName,
      last_name: lastName,
      username: username,
      expo_token: expoToken,
      os: `${Platform.OS}:${Platform.Version}`
    }

    post('signup', params)
      .then((response) => response.json())
      .then((responseJson) => {
        this.setState({submitting: false})
        if (this.validate(responseJson)) {
          navigation.navigate('Tutorial')
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
      <View style={[styles.row, {paddingTop: 10}]}>
        <TouchableOpacity
          onPress={() => navigation.navigate('RecoveryChannel')}>
          <Text style={styles.recoveryText}>Already have an account?</Text>
        </TouchableOpacity>
      </View>
    )
  }

  render () {
    const {firstName, lastName, username, submitting, invalid} = this.state
    const {version} = Constants.manifest
    return (
      <View style={{flex: 1, backgroundColor: Theme.darkBlue}}>
        <View style={styles.container}>
          <Image source={logoWhite} style={styles.logo} />
          <TextInput
            style={styles.field}
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
            style={styles.field}
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
          {this.renderDebug()}
          {this.renderRecoveryOption()}
        </View>
        <View style={[styles.row, {backgroundColor: Theme.darkBlue}]}>
          <Text style={{color: '#16213d'}}>{`${version}/${envId}`}</Text>
        </View>
        <PrimaryButton
          title="Sign Up"
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
    )
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: Theme.darkBlue,
    flex: 1,
    paddingHorizontal: 40
  },
  error: {color: 'red', width: '100%'},
  field: {
    borderBottomWidth: 1,
    borderColor: 'gray',
    color: 'white',
    fontSize: 18,
    marginVertical: 6,
    width: '100%'
  },
  logo: {width: 160, height: 156, marginVertical: 40},
  recoveryText: {
    color: Theme.lightBlue,
    textDecorationLine: 'underline',
    fontSize: 16
  },
  row: {width: '100%', flexDirection: 'row', justifyContent: 'flex-end'}
})

SignUp.propTypes = {
  navigation: PropTypes.object.isRequired
}
