import PrimaryButton from 'ferly/components/PrimaryButton';
import PropTypes from 'prop-types';
import React from 'react';
import Theme from 'ferly/utils/theme';
import {connect} from 'react-redux';
import {post} from 'ferly/utils/fetch';
import {
  Alert,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Platform
} from 'react-native';

export class SignUp extends React.Component {
  static navigationOptions = {
    title: 'Sign Up for Ferly'
  };

  constructor (props) {
    super(props);
    this.state = {
      firstName: '',
      lastName: '',
      username: '',
      fieldValue: '',
      showUsernameError: false,
      showFirstNameError: false,
      showLastNameError: false,
      invalid: {},
      submitting: false
    };
  }

  handleSubmit () {
    const {navigation} = this.props;
    const params = navigation.state.params;
    let {expoToken} = params;
    const {firstName, lastName, username, fieldValue} = this.state;
    this.setState({submitting: true});
    const login = {
      login: fieldValue,
      username: username
    };

    post('newSignup', this.props.deviceToken, login)
      .then((response) => response.json())
      .then((responseJson) => {
        this.setState({submitting: false});
        const codeLength = responseJson.code_length;
        let code = '';
        if (responseJson.revealed_codes) {
          code = responseJson.revealed_codes[0].substring(0, codeLength);
        }
        const navParams = {
          firstName: firstName,
          lastName: lastName,
          username: username,
          expoToken: expoToken,
          code: code,
          codeLength: codeLength,
          secret: responseJson.secret,
          attemptPath: responseJson.attempt_path,
          factorId: responseJson.factor_id,
          os: `${Platform.OS}:${Platform.Version}`
        };
        if (this.validate(responseJson)) {
          this.props.navigation.navigate('SignUpCode', navParams);
        }
      })
      .catch(() => {
        Alert.alert('Error trying to sign up!');
      });
  }

  validate (responseJson) {
    if (responseJson.invalid) {
      this.setState({
        invalid: responseJson.invalid
      });
      return false;
    } else if (responseJson.error === 'existing_username') {
      this.setState({invalid: {username: 'Username already taken'}});
      return false;
    } else if (responseJson.error) {
      this.setState({invalid: {fieldValue: 'Email already registered! Please Sign In.'}});
      return false;
    } else {
      return true;
    }
  }

  invalidUsernameMessage (username) {
    let msg;
    if (username.length < 4 || username.length > 20) {
      msg = 'Must be 4-20 characters long.';
    } else if (!username.charAt(0).match('^[a-zA-Z]$')) {
      msg = 'Must start with a letter.';
    } else if (!username.match('^[0-9a-zA-Z.]+$')) {
      msg = 'Must contain only letters, numbers, and periods.';
    }
    return msg;
  }

  validateUsername (username) {
    let msg = this.invalidUsernameMessage(username);
    if (msg) {
      const nextState = {username: username, invalid: {username: msg}};
      this.setState(nextState);
    } else {
      const newInvalid = Object.assign({}, this.state.invalid);
      delete newInvalid.username;
      this.setState({invalid: newInvalid});
    }
  }

  invalidFirstNameMessage (firstName) {
    let msg;
    if (firstName.length < 2 || firstName.length > 20) {
      msg = 'Must be 2-20 characters long.';
    } else if (!firstName.match('^[a-zA-Z._ ]+$')) {
      msg = 'Must contain only letters, periods, and spaces.';
    } else if (!firstName.charAt(0).match('^[a-zA-Z]$')) {
      msg = 'Must start with a letter.';
    }
    return msg;
  }

  validateFirstName (firstName) {
    let msg = this.invalidFirstNameMessage(firstName);
    if (msg) {
      const nextState = {first_name: firstName, invalid: {first_name: msg}};
      this.setState(nextState);
    } else {
      const newInvalid = Object.assign({}, this.state.invalid);
      delete newInvalid.first_name;
      this.setState({invalid: newInvalid});
    }
  }

  invalidLastNameMessage (lastName) {
    let msg;
    if (lastName.length < 2 || lastName.length > 20) {
      msg = 'Must be 2-20 characters long.';
    } else if (!lastName.match('^[-a-zA-Z _.,s]+$')) {
      msg = 'Must contain only letters, periods, dashes, and spaces.';
    } else if (!lastName.charAt(0).match('^[a-zA-Z]$')) {
      msg = 'Must start with a letter.';
    }
    return msg;
  }

  validateLastName (lastName) {
    let msg = this.invalidLastNameMessage(lastName);
    if (msg) {
      const nextState = {last_name: lastName, invalid: {last_name: msg}};
      this.setState(nextState);
    } else {
      const newInvalid = Object.assign({}, this.state.invalid);
      delete newInvalid.last_name;
      this.setState({invalid: newInvalid});
    }
  }

  renderRecoveryOption () {
    const {navigation} = this.props;
    const params = navigation.state.params;
    let {expoToken} = params;
    const signInParams = {
      expoToken: expoToken
    };
    return (
      <View style={[styles.row, {marginBottom: 30}]}>
        <Text style={{fontSize: 16}}>Already have an account?</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('RecoveryChannel', signInParams)}>
          <Text style={[styles.recoveryText, {paddingLeft: 5}]}>Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  render () {
    const {firstName, lastName, username, submitting, fieldValue, invalid} = this.state;
    count++;
    if (count < 2) {
      const text = {'text': 'sign up'};
      post('log-info-initial', this.props.deviceToken, text)
        .then((response) => response.json())
        .then((responseJson) => {
        })
        .catch(() => {
          Alert.alert('Error trying to log!');
        });
    }
    return (
      <View style={{flex: 1, backgroundColor: 'white'}}>
        <View style={{paddingHorizontal: 15}} >
          <TextInput
            style={styles.field}
            underlineColorAndroid={'transparent'}
            placeholderTextColor={'gray'}
            placeholder='First Name'
            onBlur={() => {
              this.validateFirstName(firstName);
              this.setState({showFirstNameError: false});
            }}
            onChangeText={
              (text) => {
                this.validateFirstName(text); this.setState({firstName: text});
              }
            }
            value={firstName} />
          {
            invalid.first_name || this.state.showFirstNameError
              ? (<Text style={styles.error}>{invalid.first_name}</Text>)
              : null
          }
          <TextInput
            style={styles.field}
            underlineColorAndroid={'transparent'}
            placeholderTextColor={'gray'}
            placeholder='Last Name'
            onBlur={() => {
              this.validateLastName(lastName);
              this.setState({showLastNameError: false});
            }}
            onChangeText={
              (text) => {
                this.validateLastName(text); this.setState({lastName: text});
              }
            }
            value={lastName} />
          {
            invalid.last_name || this.state.showLastNameError
              ? (<Text style={styles.error}>{invalid.last_name}</Text>)
              : null
          }
          <TextInput
            style={styles.field}
            underlineColorAndroid={'transparent'}
            placeholderTextColor={'gray'}
            placeholder='Username'
            onBlur={() => {
              this.validateUsername(username);
              this.setState({showUsernameError: false});
            }}
            onChangeText={
              (text) => {
                this.validateUsername(text); this.setState({username: text});
              }
            }
            value={username} />
          {
            invalid.username || this.state.showUsernameError
              ? (<Text style={styles.error}>{invalid.username}</Text>)
              : null
          }
          <TextInput
            style={[styles.field]}
            underlineColorAndroid={'transparent'}
            placeholderTextColor={'gray'}
            placeholder='Email Address or Phone Number'
            onChangeText={(text) => this.setState({fieldValue: text})}
            value={fieldValue} />
          {
            invalid.login
              ? (<Text style={styles.error}>{invalid.login}</Text>)
              : null
          }
        </View>
        <View style={{width: '100%', marginTop: 20}} >
          <PrimaryButton
            title="Next"
            disabled={
              firstName === '' ||
                lastName === '' ||
                submitting ||
                !!invalid.username ||
                !!invalid.first_name ||
                !!invalid.last_name ||
                !username ||
                !fieldValue ||
                !firstName ||
                !lastName
            }
            color={Theme.lightBlue}
            onPress={this.handleSubmit.bind(this)} />
        </View>
        {this.renderRecoveryOption()}
      </View>
    );
  }
}

let count = 0;

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
});

SignUp.propTypes = {
  navigation: PropTypes.object.isRequired,
  onFocus: PropTypes.object,
  onBlur: PropTypes.object,
  deviceToken: PropTypes.string.isRequired
};

function mapStateToProps (state) {
  const {deviceToken} = state.settings;
  return {
    deviceToken
  };
}

export default connect(mapStateToProps)(SignUp);
