import PrimaryButton from 'ferly/components/PrimaryButton'
import PropTypes from 'prop-types'
import React from 'react'
import Recaptcha from 'ferly/components/Recaptcha'
import Theme from 'ferly/utils/theme'
import {Notifications, Permissions} from 'expo'
import {post} from 'ferly/utils/fetch'
import {View, Text, TextInput, StyleSheet, Alert, Platform} from 'react-native'

export default class RecoveryCode extends React.Component {
  static navigationOptions = {
    title: 'Recover Account'
  };

  constructor (props) {
    super(props)
    this.state = {
      fieldValue: props.navigation.state.params.code || '',
      invalid: '',
      submitting: false,
      recaptchaResponse: '',
      expoToken: ''
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
    // iOS won't necessarily prompt the user a second time.
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
    const {navigation} = this.props
    const params = navigation.state.params
    const {attemptPath, secret, factorId} = params
    const {fieldValue, recaptchaResponse, expoToken} = this.state
    this.setState({'submitting': true, invalid: ''})

    const postParams = {
      attempt_path: attemptPath,
      secret: secret,
      factor_id: factorId,
      code: fieldValue.replace(/-/g, ''),
      recaptcha_response: recaptchaResponse,
      expo_token: expoToken,
      os: `${Platform.OS}:${Platform.Version}`
    }

    post('recover-code', postParams)
      .then((response) => response.json())
      .then((responseJson) => {
        if (this.validate(responseJson)) {
          navigation.navigate('Wallet')
        }
      })
  }

  validate (json) {
    if (json.invalid) {
      this.setState({
        invalid: json.invalid[Object.keys(json.invalid)[0]],
        submitting: false})
      return false
    } else if (json.error === 'unexpected_auth_attempt') {
      this.setState({submitting: false})
      Alert.alert(
        'Error', 'This account does not exist. Please go back and try again.')
      return false
    } else if (json.error === 'recaptcha_required') {
      this.setState({invalid: 'recaptcha required', submitting: false})
      return false
    } else if (json.error === 'code_expired') {
      Alert.alert(
        'Sorry', 'This code has expired. Please try again with a new code.')
      return false
    } else {
      return true
    }
  }

  onExecute (response) {
    this.setState({recaptchaResponse: response})
  }

  render () {
    const {fieldValue, submitting, invalid, recaptchaResponse} = this.state
    const {navigation} = this.props
    const params = navigation.state.params
    const {codeLength, loginType} = params

    let channelType = 'device'
    if (loginType === 'email') {
      channelType = 'email address'
    } else if (loginType === 'phone') {
      channelType = 'phone number'
    }

    return (
      <View style={{flex: 1, justifyContent: 'space-between'}}>
        <View style={{paddingHorizontal: 40, paddingVertical: 30}}>
          <Text style={{fontSize: 18}}>
            {`We sent a unique and temporary code to your ${channelType}. ` +
             `Enter the ${codeLength}-digit code below`}
          </Text>
          <View style={{borderBottomWidth: 1, borderColor: 'gray', paddingTop: 20}}>
            <TextInput
              style={{fontSize: 18}}
              onChangeText={(text) => this.setState({fieldValue: text})}
              autoFocus
              returnKeyType='done'
              placeholder="Enter code"
              keyboardType="numeric"
              value={fieldValue} />
            <Recaptcha
              onExecute={this.onExecute.bind(this)}
              action="recovery" />
          </View>
          {invalid ? (<Text style={styles.error}>{invalid}</Text>) : null}
        </View>
        <PrimaryButton
          title="Recover Account"
          disabled={fieldValue === '' || submitting || !recaptchaResponse}
          color={Theme.lightBlue}
          onPress={this.handleSubmit.bind(this)} />
      </View>
    )
  }
}

RecoveryCode.propTypes = {
  navigation: PropTypes.object.isRequired
}

const styles = StyleSheet.create({
  error: {
    fontSize: 16,
    color: 'red'
  }
})
