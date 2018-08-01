import PropTypes from 'prop-types'
import React from 'react'
import Theme from 'ferly/utils/theme'
import {Button, View, Text, TextInput} from 'react-native'
import {Notifications, Permissions} from 'expo'
import {post} from 'ferly/utils/fetch'

export default class SignUp extends React.Component {
  static navigationOptions = {
    title: 'Sign Up'
  };

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
    if (finalStatus !== 'granted') {
      let token = await Notifications.getExpoPushTokenAsync()
      this.setState({expoToken: token})
    }
  }

  handleSubmit () {
    const {firstName, lastName, expoToken} = this.state
    const {navigation} = this.props
    this.setState({submitting: true})
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

  render () {
    const {firstName, lastName, submitting} = this.state
    return (
      <View style={{flex: 1, paddingHorizontal: 20}}>
        <Text>
          Please Sign Up!
        </Text>
        <TextInput
          placeholder='First Name'
          onChangeText={(text) => this.setState({firstName: text})}
          value={firstName} />
        {
          this.state.invalid.first_name
            ? (<Text>{this.state.invalid.first_name}</Text>)
            : null
        }
        <TextInput
          placeholder='Last Name'
          onChangeText={(text) => this.setState({lastName: text})}
          value={lastName} />
        {
          this.state.invalid.last_name
            ? (<Text>{this.state.invalid.last_name}</Text>)
            : null
        }
        <Button
          title="Sign Up"
          disabled={firstName === '' || lastName === '' || submitting}
          color={Theme.darkBlue}
          onPress={this.handleSubmit.bind(this)} />
      </View>
    )
  }
}

SignUp.propTypes = {
  navigation: PropTypes.object.isRequired
}
