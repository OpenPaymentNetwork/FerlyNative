import PropTypes from 'prop-types'
import React from 'react'
import Theme from 'ferly/utils/theme'
import {Button, View, Text, TextInput, Image, StyleSheet} from 'react-native'
import {Notifications, Permissions, Constants} from 'expo'
import {post} from 'ferly/utils/fetch'
import {logoWhite} from 'ferly/images/index'

export default class SignUp extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      firstName: '',
      lastName: '',
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
    // iOS won't necessarily prompt the user a second time.
    if (existingStatus !== 'granted') {
      // console.log('asking for permission')
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
    const {firstName, lastName, expoToken} = this.state
    const {navigation} = this.props
    // this.setState({submitting: true})
    const params = {
      first_name: firstName,
      last_name: lastName,
      expo_token: expoToken
    }
    post('signup', params)
      .then((response) => response.json())
      .then((responseJson) => {
        if (this.validate(responseJson)) {
          navigation.navigate('Wallet')
        } else {
          this.setState({submitting: false})
        }
      })
  }

  validate (responseJson) {
    if (responseJson.invalid) {
      this.setState({
        invalid: responseJson.invalid
      })
      return false
    }
    return true
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

  render () {
    const {firstName, lastName, submitting} = this.state
    return (
      <View style={{flex: 1}}>
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
            this.state.invalid.first_name
              ? (<Text>{this.state.invalid.first_name}</Text>)
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
            this.state.invalid.last_name
              ? (<Text>{this.state.invalid.last_name}</Text>)
              : null
          }
          {this.renderDebug()}
        </View>
        <Button
          title="Sign Up"
          disabled={firstName === '' || lastName === '' || submitting}
          color={Theme.lightBlue}
          style={{
            width: '100%',
            position: 'absolute',
            bottom: 0}}
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
    padding: 40
  },
  field: {
    borderBottomWidth: 1,
    borderColor: 'gray',
    color: 'white',
    fontSize: 18,
    marginVertical: 6,
    width: '100%'
  },
  logo: {width: 160, height: 156, marginVertical: 40}
})

SignUp.propTypes = {
  navigation: PropTypes.object.isRequired
}
