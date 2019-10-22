import PrimaryButton from 'ferly/components/PrimaryButton';
import PropTypes from 'prop-types';
import React from 'react';
import Recaptcha from 'ferly/components/Recaptcha';
import Theme from 'ferly/utils/theme';
import {connect} from 'react-redux';
import {post} from 'ferly/utils/fetch';
import {View, Text, TextInput, StyleSheet, Alert} from 'react-native';

export class SignUpCode extends React.Component {
  static navigationOptions = {
    title: 'Verify Email/Phone Number'
  };

  constructor (props) {
    super(props);
    this.state = {
      fieldValue: props.navigation.state.params.code || '',
      invalid: '',
      submitting: false,
      recaptchaResponse: '',
      expoToken: '',
      showRecaptcha: false,
      resubmit: false
    };
  }

  componentDidUpdate (prevProps, prevState) {
    const {resubmit, recaptchaResponse} = this.state;
    if (resubmit && recaptchaResponse) {
      this.handleSubmit();
    }
  }

  handleSubmit () {
    let dontLogin = true;
    const {navigation} = this.props;
    const params = navigation.state.params;
    let {attemptPath, secret, factorId, firstName, lastName, expoToken, username, os} = params;
    const {fieldValue, recaptchaResponse} = this.state;
    this.setState({'submitting': true, invalid: '', resubmit: false});
    attemptPath = attemptPath.substr(1);
    const setParams = {
      first_name: firstName,
      last_name: lastName,
      secret: secret,
      attempt_path: attemptPath
    };
    const agreedParam = {
      agreed: true,
      secret: secret,
      attempt_path: attemptPath
    };
    const postParams = {
      secret: secret,
      attempt_path: attemptPath,
      factor_id: factorId,
      code: fieldValue.replace(/-/g, ''),
      recaptcha_response: recaptchaResponse
    };
    post('auth-uid', this.props.deviceToken, postParams)
      .then((response) => response.json())
      .then((responseJson) => {
        if (this.validate(responseJson)) {
          if (responseJson.profile_id) {
            const loginParams = {
              profile_id: responseJson.profile_id,
              os: responseJson.os,
              expo_token: responseJson.expo_token
            };
            post('login', this.props.deviceToken, loginParams)
              .then((response) => response.json())
              .then((responseJson) => {
                if (!responseJson.error) {
                  navigation.navigate('Wallet');
                  dontLogin = false;
                }
              });
          } else if (dontLogin) {
            post('set-signup-data', this.props.deviceToken, setParams)
              .then((response) => response.json())
              .then((responseJson) => {
                if (this.validate(responseJson)) {
                  post('signup-finish', this.props.deviceToken, agreedParam)
                    .then((response) => response.json())
                    .then((responseJson) => {
                      if (this.validate(responseJson)) {
                        const finalParams = {
                          first_name: firstName,
                          last_name: lastName,
                          username: username,
                          profile_id: responseJson.profile_id,
                          attempt_path: attemptPath,
                          secret: secret,
                          expo_token: expoToken,
                          os: os,
                          factor_id: factorId,
                          code: fieldValue.replace(/-/g, ''),
                          recaptcha_response: recaptchaResponse
                        };
                        post('register', this.props.deviceToken, finalParams)
                          .then((response) => response.json())
                          .then((responseJson) => {
                            if (this.validate(responseJson)) {
                              navigation.navigate('Tutorial');
                            }
                          });
                      }
                    });
                }
              });
          }
        }
      });
  }

  validate (json) {
    if (json.invalid) {
      this.setState({
        invalid: json.invalid[Object.keys(json.invalid)[0]],
        submitting: false});
      return false;
    } else if (json.error === 'unexpected_auth_attempt') {
      this.setState({submitting: false});
      Alert.alert(
        'Error', 'This account does not exist. Please go back and try again.');
      return false;
    } else if (json.error === 'recaptcha_required') {
      this.setState({showRecaptcha: true, resubmit: true});
      return false;
    } else if (json.error === 'code_expired') {
      Alert.alert(
        'Sorry', 'This code has expired. Please try again with a new code.');
      return false;
    } else {
      return true;
    }
  }

  onExecute (response) {
    this.setState({recaptchaResponse: response});
  }

  render () {
    const {fieldValue, submitting, invalid, showRecaptcha} = this.state;
    const {navigation} = this.props;
    const params = navigation.state.params;
    const {codeLength, loginType} = params;

    let channelType = 'device';
    if (loginType === 'email') {
      channelType = 'email address';
    } else if (loginType === 'phone') {
      channelType = 'phone number';
    }

    const recaptchaComponent = (
      <Recaptcha onExecute={this.onExecute.bind(this)} action="uid" />);

    return (
      <View style={{
        flex: 1,
        justifyContent: 'space-between',
        backgroundColor: 'white'}}>
        <View style={{paddingHorizontal: 40, paddingVertical: 30}}>
          <Text style={{fontSize: 18}}>
            {`We sent a unique and temporary code to your ${channelType}. ` +
             `Enter the ${codeLength}-digit code below.`}
          </Text>
          <View style={{
            borderBottomWidth: 1,
            borderColor: 'gray',
            paddingTop: 20}}>
            <TextInput
              style={{fontSize: 18}}
              onChangeText={(text) => this.setState({fieldValue: text})}
              autoFocus
              returnKeyType='done'
              placeholder="Enter code"
              keyboardType="numeric"
              value={fieldValue} />
            {showRecaptcha ? recaptchaComponent : null}
          </View>
          {invalid ? (<Text style={styles.error}>{invalid}</Text>) : null}
        </View>
        <PrimaryButton
          title="Verify Email/Phone"
          disabled={fieldValue === '' || submitting}
          color={Theme.lightBlue}
          onPress={this.handleSubmit.bind(this)} />
      </View>
    );
  }
}

SignUpCode.propTypes = {
  navigation: PropTypes.object.isRequired,
  deviceToken: PropTypes.string.isRequired
};

const styles = StyleSheet.create({
  error: {
    fontSize: 16,
    color: 'red'
  }
});

function mapStateToProps (state) {
  const {deviceToken} = state.settings;
  return {
    deviceToken
  };
}

export default connect(mapStateToProps)(SignUpCode);
