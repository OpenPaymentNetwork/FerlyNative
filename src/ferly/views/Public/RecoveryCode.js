import PrimaryButton from 'ferly/components/PrimaryButton';
import PropTypes from 'prop-types';
import React from 'react';
import Recaptcha from 'ferly/components/Recaptcha';
import Theme from 'ferly/utils/theme';
import {setIsCustomer} from 'ferly/store/settings';
import {connect} from 'react-redux';
import {post} from 'ferly/utils/fetch';
import {AsyncStorage, View, Text, TextInput, StyleSheet, Alert, Platform} from 'react-native';

export class RecoveryCode extends React.Component {
  static navigationOptions = {
    title: 'Recover Account'
  };

  constructor (props) {
    super(props);
    this.state = {
      fieldValue: props.navigation.state.params.code || '',
      invalid: '',
      submitting: false,
      recaptchaResponse: '',
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

  async storage () {
    AsyncStorage.setItem('isCustomer', 'true').then(() => {
      try {
        this.props.dispatch(setIsCustomer('true'));
      } catch (error) {
        Alert.alert('error', error);
      }
    });
  }

  handleSubmit () {
    const {navigation} = this.props;
    const params = navigation.state.params;
    let {attemptPath, secret, factorId, expoToken} = params;
    const {fieldValue, recaptchaResponse} = this.state;
    this.setState({'submitting': true, invalid: '', resubmit: false});

    if (!expoToken) {
      if (this.props.initialExpoToken) {
        expoToken = this.props.initialExpoToken;
      } else {
        expoToken = this.props.expoToken;
      }
    }

    const postParams = {
      attempt_path: attemptPath,
      secret: secret,
      factor_id: factorId,
      code: fieldValue.replace(/-/g, ''),
      recaptcha_response: recaptchaResponse,
      expo_token: expoToken,
      os: `${Platform.OS}:${Platform.Version}`
    };
    post('recover-code', this.props.deviceToken, postParams)
      .then((response) => response.json())
      .then((responseJson) => {
        if (this.validate(responseJson)) {
          const text = {'text': 'successful recover code'};
          post('log-info-inital', this.props.deviceToken, text)
            .then((response) => response.json())
            .then((responseJson) => {
            })
            .catch(() => {
              console.log('log error');
            });
          this.storage().then((responseJson) => {
            navigation.navigate('Wallet');
          });
        }
      })
      .catch(() => {
        Alert.alert('Error trying to recover!');
      });
  }

  validate (json) {
    const text = {'text': 'validate recover code'};
    post('log-info-initial', this.props.deviceToken, text)
      .then((response) => response.json())
      .then((responseJson) => {
      })
      .catch(() => {
        console.log('log error');
      });
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
    count++;
    if (count < 2) {
      const text = {'text': 'sign in code'};
      post('log-info-initial', this.props.deviceToken, text)
        .then((response) => response.json())
        .then((responseJson) => {
        })
        .catch(() => {
          Alert.alert('Error please check internet connection!');
        });
    }

    let channelType = 'device';
    if (loginType === 'email') {
      channelType = 'email address';
    } else if (loginType === 'phone') {
      channelType = 'phone number';
    }

    const recaptchaComponent = (
      <Recaptcha onExecute={this.onExecute.bind(this)} action="recovery" />);

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
          title="Recover Account"
          disabled={fieldValue === '' || submitting}
          color={Theme.lightBlue}
          onPress={this.handleSubmit.bind(this)} />
      </View>
    );
  }
}

let count = 0;

RecoveryCode.propTypes = {
  dispatch: PropTypes.func.isRequired,
  navigation: PropTypes.object.isRequired,
  deviceToken: PropTypes.string.isRequired,
  expoToken: PropTypes.string.isRequired,
  initialExpoToken: PropTypes.string
};

const styles = StyleSheet.create({
  error: {
    fontSize: 16,
    color: 'red'
  }
});

function mapStateToProps (state) {
  const {deviceToken, expoToken, initialExpoToken} = state.settings;
  return {
    deviceToken,
    expoToken,
    initialExpoToken
  };
}

export default connect(mapStateToProps)(RecoveryCode);
