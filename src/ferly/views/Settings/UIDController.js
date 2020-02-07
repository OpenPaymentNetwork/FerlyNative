import Icon from 'react-native-vector-icons/FontAwesome';
import PropTypes from 'prop-types';
import React from 'react';
import Recaptcha from 'ferly/components/Recaptcha';
import Theme from 'ferly/utils/theme';
import {apiExpire} from 'ferly/store/api';
import {connect} from 'react-redux';
import {urls, post} from 'ferly/utils/fetch';
import {StackActions} from 'react-navigation';
import {
  View,
  Text,
  Button,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet
} from 'react-native';

export class UIDController extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      showForm: false,
      formValue: '',
      showCode: false,
      attemptId: '',
      secret: '',
      code: '',
      codeLength: 6,
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
      this.handleCodeSubmit();
    }
  }

  onExecute (response) {
    this.setState({recaptchaResponse: response});
  }

  handleUIDRequest () {
    const {formValue} = this.state;
    const {type} = this.props;
    const postParams = {
      login: formValue,
      uid_type: type
    };

    this.setState({submitting: true});
    post('add-uid', this.props.deviceToken, postParams)
      .then((response) => response.json())
      .then((json) => {
        if (this.validate(json)) {
          const text = {'text': 'successful add uid'};
          post('log-info', this.props.deviceToken, text)
            .then((response) => response.json())
            .then((responseJson) => {
            })
            .catch(() => {
              console.log('log error');
            });
          const attemptId = json.attempt_id;
          const codeLength = json.code_length;
          const {secret} = json;
          let code = '';
          if (json.revealed_codes) {
            code = json.revealed_codes[0].substring(0, codeLength);
          }
          this.setState({
            showCode: true,
            invalid: '',
            code: code,
            codeLength: codeLength,
            secret: secret,
            attemptId: attemptId,
            submitting: false
          });
        }
      })
      .catch(() => {
        const text = {'text': 'Call failed: add uid'};
        post('log-info', this.props.deviceToken, text)
          .then((response) => response.json())
          .then((responseJson) => {
          })
          .catch(() => {
            console.log('log error');
          });
        Alert.alert('Error trying to add!');
      });
  }

  validate (json) {
    const text = {'text': 'Unsuccessful add and comfirm uid'};
    post('log-info', this.props.deviceToken, text)
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
    } else if (json.error === 'code_expired') {
      Alert.alert(
        'Sorry', 'This code has expired. Please try again with a new code.');
      this.setState({
        invalid: '',
        showCode: false,
        secret: '',
        attemptId: '',
        submitting: false,
        code: '',
        formValue: '',
        showForm: false
      });
      return false;
    } else if (json.error === 'recaptcha_required') {
      this.setState({showRecaptcha: true, resubmit: true, submitting: false});
      return false;
    } else if (json.error) {
      this.setState({submitting: false});
      Alert.alert(
        'Error', 'Please try again with a new code.');
      return false;
    } else {
      return true;
    }
  }

  handleCodeSubmit () {
    const {type, uid, navigation} = this.props;
    const {secret, attemptId, code, recaptchaResponse} = this.state;
    const postParams = {
      secret: secret,
      attempt_id: attemptId,
      code: code.replace(/-/g, ''),
      recaptcha_response: recaptchaResponse
    };
    if (uid) {
      postParams['replace_uid'] = `${type}:${uid}`;
    }
    this.setState({submitting: true, resubmit: false});
    post('confirm-uid', this.props.deviceToken, postParams)
      .then((response) => response.json())
      .then((json) => {
        if (this.validate(json)) {
          const text = {'text': 'successful confirm uid'};
          post('log-info', this.props.deviceToken, text)
            .then((response) => response.json())
            .then((responseJson) => {
            })
            .catch(() => {
              console.log('log error');
            });
          let title;
          if (type === 'email') {
            title = 'Email Address';
          } else if (type === 'phone') {
            title = 'Phone Number';
          }
          const lowerTitle = title.toLowerCase();
          const message = `Thank you! Your ${lowerTitle} has been verified ` +
            `and can be used for account recovery in the future.`;
          Alert.alert(`${title} Verified`, message);
          this.props.apiExpire(urls.profile);

          const resetAction = StackActions.reset({
            index: 1,
            actions: [
              StackActions.push({routeName: 'Settings'}),
              StackActions.push({routeName: 'Recovery'})
            ]
          });
          navigation.dispatch(resetAction);
        }
      })
      .catch(() => {
        Alert.alert('Error trying to confirm!');
      });
  }

  render () {
    count++;
    if (count < 2) {
      const text = {'text': 'UIDController'};
      post('log-info', this.props.deviceToken, text)
        .then((response) => response.json())
        .then((responseJson) => {
        })
        .catch(() => {
          Alert.alert('Error please check internet connection!');
        });
    }
    const {uid, type} = this.props;
    const {
      showForm,
      formValue,
      showCode,
      code,
      codeLength,
      invalid,
      submitting,
      showRecaptcha
    } = this.state;

    let title;
    if (type === 'email') {
      title = 'Email Address';
    } else if (type === 'phone') {
      title = 'Phone Number';
    }

    let body;
    if (showCode) {
      const recaptchaComponent = (
        <Recaptcha onExecute={this.onExecute.bind(this)} action="uid" />);
      body = (
        <View>
          <Text style={styles.subtitle}>
            {`We sent a unique and temporary code to your ${type}. ` +
             `Enter the ${codeLength}-digit code below.`}
          </Text>
          <View style={styles.line}>
            <View style={styles.inputContainer}>
              <TextInput
                onChangeText={(text) => this.setState({code: text})}
                autoFocus
                underlineColorAndroid={'transparent'}
                returnKeyType='done'
                style={styles.button}
                keyboardType="numeric"
                value={code} />
            </View>
            <Button
              title="VERIFY"
              color={Theme.lightBlue}
              disabled={submitting || code === ''}
              onPress={this.handleCodeSubmit.bind(this)} />
          </View>
          {showRecaptcha ? recaptchaComponent : null}
        </View>
      );
    } else if (showForm) {
      let message;
      let keyboardType;
      if (type === 'email') {
        keyboardType = 'email-address';
        message = 'Enter an email address to use for account recovery. ' +
          'We\'ll send a code for you to verify your address.';
      } else if (type === 'phone') {
        keyboardType = 'numeric';
        message = 'Enter a phone number to use for account recovery. ' +
          'We\'ll send a code for you to verify your phone number.';
      }

      body = (
        <View>
          <Text style={styles.subtitle}>{message}</Text>
          <View style={styles.line}>
            <View style={styles.inputContainer}>
              <TextInput
                onChangeText={(text) => this.setState({formValue: text})}
                autoFocus
                returnKeyType='done'
                underlineColorAndroid={'transparent'}
                style={styles.button}
                keyboardType={keyboardType}
                value={formValue} />
            </View>
            <Button
              title="NEXT"
              style={{flexShrink: 1}}
              color={Theme.lightBlue}
              disabled={submitting}
              onPress={this.handleUIDRequest.bind(this)} />
          </View>
        </View>
      );
    } else if (uid) {
      body = (
        <View style={styles.line}>
          <Text style={{fontSize: 16}}>{uid}</Text>
          <Button
            title="CHANGE"
            color={Theme.lightBlue}
            disabled={submitting}
            onPress={() => this.setState({showForm: true})} />
        </View>
      );
    } else {
      body = (
        <TouchableOpacity
          style={{width: '100%', height: 24, justifyContent: 'center'}}
          onPress={() => this.setState({showForm: true})}>
          <Icon
            name="plus"
            color={Theme.lightBlue}
            size={18} />
        </TouchableOpacity>
      );
    }

    let error;
    if (invalid) {
      error = <Text style={{color: 'red'}}>{invalid}</Text>;
    }

    return (
      <View style={styles.container}>
        <Text style={styles.label}>{title}</Text>
        {body}
        {error}
      </View>
    );
  }
}

let count = 0;

const styles = StyleSheet.create({
  container: {
    padding: 20
  },
  label: {
    color: Theme.lightBlue,
    fontSize: 16,
    fontWeight: 'bold',
    paddingBottom: 14
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 14
  },
  line: {
    justifyContent: 'space-between',
    flexDirection: 'row'
  },
  button: {
    flexShrink: 1,
    minWidth: '100%'
  },
  inputContainer: {
    borderBottomWidth: 1,
    borderColor: 'gray',
    flexShrink: 1,
    marginRight: 20
  }
});

UIDController.propTypes = {
  apiExpire: PropTypes.func.isRequired,
  navigation: PropTypes.object.isRequired,
  type: PropTypes.string,
  uid: PropTypes.string,
  deviceToken: PropTypes.string.isRequired
};

function mapStateToProps (state) {
  const {deviceToken} = state.settings;
  return {
    deviceToken
  };
}

const mapDispatchToProps = {
  apiExpire
};

export default connect(mapStateToProps, mapDispatchToProps)(UIDController);
