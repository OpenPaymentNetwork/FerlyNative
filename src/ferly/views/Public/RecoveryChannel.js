import PrimaryButton from 'ferly/components/PrimaryButton'
import PropTypes from 'prop-types'
import React from 'react'
import Theme from 'ferly/utils/theme'
import {post} from 'ferly/utils/fetch'
import {View, Text, TextInput, StyleSheet} from 'react-native'

export default class RecoveryChannel extends React.Component {
  static navigationOptions = {
    title: 'Recover Account'
  };

  constructor (props) {
    super(props)
    this.state = {
      fieldValue: '',
      invalid: '',
      submitting: false
    }
  }

  handleSubmit () {
    const {navigation} = this.props
    const {fieldValue} = this.state

    this.setState({'submitting': true, invalid: ''})

    const postParams = {
      'login': fieldValue
    }

    post('recover', postParams)
      .then((response) => response.json())
      .then((responseJson) => {
        if (this.validate(responseJson)) {
          this.setState({submitting: false})
          const codeLength = responseJson.code_length
          let code = ''
          if (responseJson.revealed_codes) {
            code = responseJson.revealed_codes[0].substring(0, codeLength)
          }
          const navParams = {
            attemptPath: responseJson.attempt_path,
            secret: responseJson.secret,
            factorId: responseJson.factor_id,
            code: code,
            loginType: responseJson.login_type,
            codeLength: codeLength
          }
          navigation.navigate('RecoveryCode', navParams)
        }
      })
  }

  validate (json) {
    if (json.invalid) {
      this.setState({'invalid': json.invalid, submitting: false})
      return false
    } else if (json.error) {
      return false
    }
    return true
  }

  render () {
    const {fieldValue, invalid, submitting} = this.state

    return (
      <View style={{
        flex: 1,
        justifyContent: 'space-between',
        backgroundColor: 'white'}}>
        <View style={{paddingHorizontal: 40, paddingVertical: 30}}>
          <View style={{
            borderBottomWidth: 1,
            paddingTop: 20}}>
            <TextInput
              style={{fontSize: 18}}
              onChangeText={(text) => this.setState({fieldValue: text})}
              autoFocus
              placeholder="Phone Number or Email"
              keyboardType="email-address"
              value={fieldValue} />
          </View>
          {
            invalid.login
              ? (<Text style={styles.error}>{invalid.login}</Text>)
              : null
          }
        </View>
        <PrimaryButton
          title="Next"
          disabled={fieldValue === '' || submitting}
          color={Theme.lightBlue}
          onPress={this.handleSubmit.bind(this)} />
      </View>
    )
  }
}

RecoveryChannel.propTypes = {
  navigation: PropTypes.object.isRequired
}

const styles = StyleSheet.create({
  error: {
    fontSize: 16,
    color: 'red'
  }
})
